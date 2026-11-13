import wave, sys, numpy as np, glob
for fn in sorted(glob.glob('hp70/*.wav')):
    w=wave.open(fn); sr=w.getframerate(); n=w.getnframes(); ch=w.getnchannels()
    x=np.frombuffer(w.readframes(n), dtype=np.int16).astype(np.float64)/32768; x=x.reshape(-1,ch)
    m=x.mean(axis=1); pk=np.abs(x).max(); clip=(np.abs(x)>0.985).mean()*100
    half=len(m)//2
    def rms(a): return 20*np.log10(np.sqrt((a**2).mean())+1e-9)
    # Bänder
    F=np.abs(np.fft.rfft(m*np.hanning(len(m))))**2; f=np.fft.rfftfreq(len(m),1/sr); tot=F.sum()+1e-12
    lo=F[f<150].sum()/tot*100; mid=F[(f>=150)&(f<2000)].sum()/tot*100; hi=F[f>=2000].sum()/tot*100
    # stille Stellen
    win=sr//10; e=np.array([np.sqrt((m[i:i+win]**2).mean()) for i in range(0,len(m)-win,win)]); sil=(e<0.003).mean()*100
    print(f"{fn.split('/')[-1]:14s} {len(m)/sr:5.1f}s Spitze {pk:.2f} Clip {clip:.3f}% RMS Strophe {rms(m[:half]):6.1f} Refrain {rms(m[half:]):6.1f} dB | Bass {lo:4.1f}% Mitte {mid:4.1f}% Höhen {hi:4.1f}% | still {sil:4.1f}%")
