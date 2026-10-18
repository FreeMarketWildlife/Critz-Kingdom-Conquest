from PIL import Image,ImageDraw,ImageFont
from pathlib import Path
R=Path(__file__).resolve().parents[1]
clips=[('Theo_Idle',49,'Idle'),('Theo_Walk',33,'Walk'),('Theo_HeavyPunch',25,'Heavy punch'),('Theo_GroundSlam',37,'Ground slam'),('Theo_Challenge',49,'Challenge'),('Theo_HitReact',19,'Hit reaction')]
font=ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial.ttf',20)
sets=[]
for name,length,label in clips:
    frames=[Image.open(R/'renders'/name/f'{i:03}.png').convert('RGB') for i in range(16)];sets.append(frames)
    frames[0].save(R/'renders'/f'{name}.gif',save_all=True,append_images=frames[1:],duration=round((length-1)/24/16*1000),loop=0)
grid=[]
for i in range(60):
    canvas=Image.new('RGB',(960,700),(30,33,37));draw=ImageDraw.Draw(canvas)
    for j,((name,length,label),frames) in enumerate(zip(clips,sets)):
        col=j%3;row=j//3;duration=(length-1)/24;t=(i/10)%duration;index=min(15,round(t/duration*15))
        canvas.paste(frames[index],(col*320,row*350));draw.text((col*320+14,row*350+325),label,font=font,fill=(235,236,239))
    grid.append(canvas.resize((720,525),Image.Resampling.LANCZOS))
palette=grid[0].quantize(colors=64)
grid=[frame.quantize(palette=palette,dither=Image.Dither.NONE) for frame in grid]
grid[0].save(R/'renders'/'theo_six_animations.gif',save_all=True,append_images=grid[1:],duration=100,loop=0,optimize=True)
sheet=Image.new('RGB',(1280,6*350),(30,33,37));draw=ImageDraw.Draw(sheet)
for row,((name,length,label),frames) in enumerate(zip(clips,sets)):
    for col,index in enumerate([0,5,10,15]):sheet.paste(frames[index],(col*320,row*350))
    draw.text((14,row*350+325),label,font=font,fill=(235,236,239))
sheet.save(R/'renders'/'theo_motion_contact_sheet.png')
print('PREVIEWS_READY',R/'renders'/'theo_six_animations.gif')
