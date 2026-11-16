#!/usr/bin/env python3
"""Build static audio editions. Source articles are never modified."""
import argparse
import datetime as dt
import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import tempfile

from bs4 import BeautifulSoup

VOICE = os.getenv("KOKORO_VOICE", "bf_isabella")
VERSION = "kokoro-0.9.4-v1-0-64k-v1"
RATE = 24000
SECTIONS = ("news", "london-fringe-theatre")
RETENTION = 30
MAX_BYTES = 850_000_000
ROOT = Path(__file__).resolve().parents[1]

def clean(text):
    return " ".join(text.split())

def extract(path):
    soup = BeautifulSoup(path.read_text(encoding="utf-8"), "html.parser")
    article = soup.select_one("main article")
    if not article:
        return None
    hero = article.select_one(".hero")
    body = article.select_one(".content")
    stamp = hero.select_one("time[datetime]") if hero else None
    if not hero or not body or not stamp:
        return None
    try:
        published = dt.date.fromisoformat(stamp["datetime"][:10])
    except ValueError:
        return None
    title = clean(hero.select_one("h1").get_text(" ", strip=True))
    parts = [title]
    lead = hero.select_one(".lead")
    if lead:
        parts.append(clean(lead.get_text(" ", strip=True)))
    for el in body.select("p,h2,h3,li,blockquote"):
        if el.find_parent(class_=["sources", "side"]):
            continue
        if el.find_parent(["li", "blockquote"]):
            continue
        text = clean(el.get_text(" ", strip=True))
        if text:
            parts.append(text)
    if len(parts) < 3:
        return None
    return soup, hero, published, parts

def key_for(parts):
    return hashlib.sha256((VERSION+"\n"+VOICE+"\n"+"\n".join(parts)).encode()).hexdigest()

def duration(path):
    result = subprocess.run(["ffprobe","-v","error","-select_streams","a:0","-show_entries",
        "format=duration:stream=codec_name","-of","json",str(path)],
        capture_output=True,text=True,check=True)
    data=json.loads(result.stdout)
    seconds=float(data["format"]["duration"])
    if not 3 < seconds < 1800 or data["streams"][0]["codec_name"] != "mp3":
        raise ValueError("Invalid audio")
    return seconds

def engine():
    import torch
    from kokoro import KPipeline
    torch.set_num_threads(min(4,os.cpu_count() or 1))
    return KPipeline(lang_code="b", repo_id="hexgrad/Kokoro-82M", device="cpu")

def render(pipeline, parts, target):
    import numpy as np
    import soundfile as sf
    clips=[]
    for paragraph in parts:
        for _, phonemes, audio in pipeline(paragraph, voice=VOICE, speed=1.0):
            if audio is None or not phonemes:
                raise ValueError("Empty narration segment")
            chunk=np.asarray(audio,dtype=np.float32).reshape(-1)
            if not np.isfinite(chunk).all() or len(chunk)<100:
                raise ValueError("Invalid narration segment")
            clips.append(chunk)
        clips.append(np.zeros(int(RATE*.25),dtype=np.float32))
    if not clips:
        raise ValueError("No narration")
    with tempfile.TemporaryDirectory() as tmp:
        wav=Path(tmp)/"speech.wav"
        sf.write(wav,np.concatenate(clips),RATE)
        pending=target.with_suffix(".pending.mp3")
        try:
            subprocess.run(["ffmpeg","-hide_banner","-loglevel","error","-y","-i",str(wav),
                "-af","loudnorm=I=-16:TP=-1.5:LRA=11","-ac","1","-ar","24000",
                "-codec:a","libmp3lame","-b:a","64k",str(pending)],check=True)
            duration(pending)
            pending.replace(target)
        finally:
            pending.unlink(missing_ok=True)

def attach(soup, hero, path, seconds):
    block=soup.new_tag("section",attrs={"class":"article-audio","aria-label":"Article narration"})
    label=soup.new_tag("p",attrs={"class":"article-audio-label"})
    label.string="Listen to this article"
    desc=soup.new_tag("span",attrs={"class":"article-audio-description"})
    desc.string=f"AI narration · {int(seconds)//60}:{int(seconds)%60:02d}"
    audio=soup.new_tag("audio",attrs={"controls":"","preload":"none","aria-label":"Listen to this article"})
    source=soup.new_tag("source",attrs={"src":path,"type":"audio/mpeg"})
    audio.append(source)
    link=soup.new_tag("a",href=path)
    link.string="Listen to the MP3"
    audio.append(link)
    speed=soup.new_tag("label",attrs={"class":"article-audio-speed"})
    speed.append("Playback speed ")
    select=soup.new_tag("select",attrs={"aria-label":"Playback speed"})
    for rate in (0.75,1,1.25,1.5,2):
        opt=soup.new_tag("option",value=str(rate))
        if rate==1: opt["selected"]=""
        opt.string=f"{rate:g}×"
        select.append(opt)
    speed.append(select)
    block.extend([label,desc,audio,speed])
    hero.insert_after(block)
    style=soup.new_tag("link",rel="stylesheet",href="/assets/article-audio.css?v=20261116-3")
    soup.head.append(style)
    script=soup.select_one('script[src="/assets/article-audio.js"]')
    if script:
        script["src"]="/assets/article-audio.js?v=20261116-3"
    else:
        soup.body.append(soup.new_tag("script",src="/assets/article-audio.js?v=20261116-3",defer=""))

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--site",type=Path,required=True)
    parser.add_argument("--cache",type=Path,required=True)
    parser.add_argument("--today",type=dt.date.fromisoformat,default=dt.datetime.now(dt.timezone.utc).date())
    parser.add_argument("--require-audio",action="store_true")
    parser.add_argument("--limit",type=int,default=0)
    args=parser.parse_args()
    args.cache.mkdir(parents=True,exist_ok=True)
    out=args.site/"assets"/"audio"
    if out.exists(): shutil.rmtree(out)
    out.mkdir(parents=True)
    pipeline=None
    active=set()
    report=[]
    errors=[]
    eligible=[]
    for section in SECTIONS:
        for path in sorted((args.site/section).glob("*.html")):
            item=extract(path)
            if not item: continue
            soup,hero,published,parts=item
            age=(args.today-published).days
            if 0<=age<RETENTION:
                eligible.append((path,soup,hero,published,parts))
    if args.limit:
        selected=[]
        for section in SECTIONS:
            match=next((item for item in eligible if item[0].parent.name==section),None)
            if match: selected.append(match)
        eligible=selected[:args.limit]
    for path,soup,hero,published,parts in eligible:
        digest=key_for(parts)
        name=f"{digest}.mp3"
        cached=args.cache/name
        active.add(name)
        try:
            if cached.exists():
                try: duration(cached)
                except Exception: cached.unlink()
            if not cached.exists():
                if pipeline is None: pipeline=engine()
                render(pipeline,parts,cached)
            seconds=duration(cached)
            shutil.copyfile(cached,out/name)
            attach(soup,hero,"/assets/audio/"+name,seconds)
            formatted = subprocess.run(
                ["node", str(ROOT / "scripts/format_articles.mjs"), "--stdin"],
                input=str(soup), text=True, capture_output=True, check=True,
            ).stdout
            path.write_text(formatted, encoding="utf-8")
            report.append({"article":"/"+str(path.relative_to(args.site)),"audio":"/assets/audio/"+name,
                "published":published.isoformat(),"duration_seconds":round(seconds,2),
                "bytes":cached.stat().st_size})
            print("AUDIO",path.name,round(seconds,1),flush=True)
        except Exception as exc:
            errors.append({"article":str(path.relative_to(args.site)),"error":str(exc)})
            print("WARNING:",path.name,exc,flush=True)
    if not args.limit:
        for path in args.cache.glob("*.mp3"):
            if path.name not in active: path.unlink()
    if args.require_audio and (errors or not report):
        raise SystemExit("Audio preview failed: "+str(errors))
    (out/"manifest.json").write_text(json.dumps({"voice":VOICE,"retention_days":RETENTION,
        "generated_at":dt.datetime.now(dt.timezone.utc).isoformat(),"articles":report,"errors":errors},indent=2))
    total=sum(p.stat().st_size for p in args.site.rglob("*") if p.is_file())
    if total>MAX_BYTES:
        raise SystemExit("Website exceeds safe Pages storage budget")
    print(f"Audio: {len(report)}/{len(eligible)}; site bytes: {total}; errors: {len(errors)}")
if __name__=="__main__":
    main()
