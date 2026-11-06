"""Genera vendor/icc/fogra39-lut.bin: tabella 33x33x33 sRGB -> CMYK (ISO Coated v2 ECI / FOGRA39).
Calcolata con littleCMS (Pillow ImageCms), intento colorimetrico relativo + compensazione del punto nero,
come la conversione predefinita di Photoshop. L'app interpola questa tabella pixel per pixel."""
from PIL import Image, ImageCms
import sys
N=33
icc=sys.argv[1] if len(sys.argv)>1 else 'vendor/icc/ISOcoated_v2_eci.icc'
src=ImageCms.createProfile('sRGB');dst=ImageCms.getOpenProfile(icc)
t=ImageCms.buildTransform(src,dst,'RGB','CMYK',renderingIntent=ImageCms.Intent.RELATIVE_COLORIMETRIC,flags=ImageCms.Flags.BLACKPOINTCOMPENSATION)
v=[round(i*255/(N-1)) for i in range(N)]
im=Image.new('RGB',(N*N*N,1));im.putdata([(r,g,b) for r in v for g in v for b in v])
out=ImageCms.applyTransform(im,t)
open('vendor/icc/fogra39-lut.bin','wb').write(out.tobytes())
print('ok',len(out.tobytes()))
