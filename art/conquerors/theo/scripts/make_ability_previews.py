from PIL import Image,ImageDraw,ImageFont
from pathlib import Path
R=Path(__file__).resolve().parents[1];D=R/'renders'/'abilities'
font=ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial.ttf',19)
sets=[]
for name,label in [('Theo_MoonshineDrink','Moonshine drink'),('Theo_CrackAbility','Crack ability')]:
    frames=[Image.open(D/name/f'{i:03}.png').convert('RGB') for i in range(25)];sets.append(frames)
    palette=frames[0].quantize(colors=96);frames=[f.quantize(palette=palette,dither=Image.Dither.NONE) for f in frames]
    frames[0].save(D/f'{name}.gif',save_all=True,append_images=frames[1:],duration=120,loop=0,optimize=True)
grid=[]
for i in range(25):
    canvas=Image.new('RGB',(720,390),(28,31,35));draw=ImageDraw.Draw(canvas)
    for j,label in enumerate(['Moonshine drink','Crack ability']):
        canvas.paste(sets[j][i].resize((360,360),Image.Resampling.LANCZOS),(j*360,0));draw.text((j*360+12,365),label,font=font,fill=(230,232,235))
    grid.append(canvas)
palette=grid[0].quantize(colors=96);grid=[f.quantize(palette=palette,dither=Image.Dither.NONE) for f in grid]
grid[0].save(D/'theo_two_abilities.gif',save_all=True,append_images=grid[1:],duration=120,loop=0,optimize=True)
contact=Image.new('RGB',(1440,1020),(28,31,35));draw=ImageDraw.Draw(contact)
for row,label in enumerate(['Moonshine drink','Crack ability']):
    for col,idx in enumerate([0,8,14]):contact.paste(sets[row][idx],(col*480,row*510))
    draw.text((12,row*510+485),label,font=font,fill=(230,232,235))
contact.save(D/'theo_abilities_contact_sheet.png');print('ABILITY_PREVIEWS_READY')
