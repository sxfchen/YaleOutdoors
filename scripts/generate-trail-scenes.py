"""Rebuild the static, hand-drawn trail header SVGs. Run from the repo root."""
from pathlib import Path
import random

OUT = Path(__file__).resolve().parents[1] / 'site' / 'img'
PALETTES = {
    'spring': ('#c9d5bc', '#a7bb8b', '#839d72', '#597650', '#b2c78e'),
    'summer': ('#bdcdc2', '#91ab94', '#708e72', '#47664d', '#91ac78'),
    'autumn': ('#d0c3ad', '#bba780', '#a88756', '#836044', '#c39960'),
    'winter': ('#d0dce0', '#b2c6cc', '#95aeb4', '#667e82', '#dce5e3'),
}
TREE_HUES = {
    'spring': ('#8fa875', '#a3b881', '#789b71', '#b0bd83', '#88a681'),
    'summer': ('#597e5d', '#78945f', '#648b78', '#879e70', '#4f7462'),
    'autumn': ('#bf9550', '#b77545', '#a55f48', '#c6a365', '#93804c'),
    'winter': ('#667e82', '#758789', '#68797d', '#7d8988', '#5d757b'),
}
SKIES = {'day': ('#d7e5e8', '#d7e5e8'), 'night': ('#1b2d44', '#1b2d44')}

# Crown and branches sit comfortably inside their viewBox to avoid clipped lobes.
CROWN = ('M30 189C13 188 7 171 18 157C3 142 9 122 25 118'
         'C16 98 30 79 48 80C45 60 59 44 77 48C87 29 110 31 118 48'
         'C139 42 154 58 150 77C169 82 173 104 161 119'
         'C179 133 174 155 158 163C164 185 144 201 125 193'
         'C113 209 90 211 76 199C59 210 35 207 30 189Z')
BRANCHES = ('M90 318Q85 253 90 188Q91 136 82 100'
            'M89 234Q65 207 48 172L37 150M88 203Q113 176 133 145L143 118'
            'M89 179Q65 151 58 122L51 103M90 158Q106 130 111 98L119 75'
            'M83 113L73 85M62 142L38 132M123 159L149 153M107 114L95 93')
RIDGES = [
 'M-100 755C45 713 96 648 169 665S263 628 332 592S424 604 492 651S565 685 641 645S730 558 794 580S890 671 955 638S1062 543 1126 565S1220 658 1301 630S1452 656 1700 743',
 'M-100 850C44 778 135 723 221 739S327 699 409 718S533 813 634 774S748 684 837 716S958 793 1053 751S1197 685 1292 734S1444 759 1700 699',
 'M-100 929C69 831 172 819 285 848S445 911 575 864S749 805 872 838S1040 913 1164 854S1401 801 1700 858',
]

def tree(x, y, height, color, winter, variant=0):
    scale = height / 320
    mirror = -1 if variant % 2 else 1
    center = x + height * .28
    # Vary lean and width, keeping every branch joined to the trunk.
    return (f'<g transform="translate({center:.1f} {y}) scale({scale*mirror:.3f} {scale:.3f}) translate(-90 0)" '
            f'stroke-linecap="round" stroke-linejoin="round">'
            + ('' if winter else f'<path d="{CROWN}" fill="{color}" stroke="{color}" stroke-width="2"/>')
            + f'<path d="{BRANCHES}" fill="none" stroke="{color if winter else "#6d6850"}" stroke-width="{3 if winter else 3.5}"/>'
            + ('' if winter else '<path d="M30 157q12-8 21-5m64-77q12 6 17 16M123 177q13 3 23-7M42 101q8-10 17-9" stroke="#f4edd3" opacity=".3" fill="none"/>')
            + '</g>')


def ground_height(x):
    # Use the same cubic hillside as the fill below, including its 65px offset.
    segments = [((-100,923),(120,836),(236,877),(390,911)),
                ((390,911),(544,945),(655,947),(800,922)),
                ((800,922),(945,897),(1064,861),(1220,890)),
                ((1220,890),(1376,919),(1462,934),(1700,866))]
    points = next((p for p in segments if p[0][0] <= x <= p[3][0]), segments[-1])
    def coordinate(t, axis):
        return sum(weight*p[axis] for weight,p in zip(((1-t)**3,3*(1-t)**2*t,3*(1-t)*t*t,t**3), points))
    low, high = 0., 1.
    for _ in range(24):
        mid = (low+high)/2
        if coordinate(mid,0) < x: low = mid
        else: high = mid
    return coordinate((low+high)/2,1)+65


def build(season, phase):
    far, middle, near, ink, leaves = PALETTES[season]
    tree_hues = TREE_HUES[season]
    earth, edge, stone = ('#c8c4ad', '#999a8a', '#d9d7c8') if season == 'winter' else ('#bca781', '#8a805f', '#d1c1a2')
    if phase == 'night':
        def night_ink(color):
            rgb = [int(color[i:i+2], 16) for i in (1, 3, 5)]
            return '#' + ''.join(f'{round(c*.55+t*.45):02x}' for c, t in zip(rgb, (20, 36, 59)))
        far, middle, near, ink, leaves = map(night_ink, (far, middle, near, ink, leaves))
        earth, edge, stone = map(night_ink, (earth, edge, stone))
        tree_hues = tuple(map(night_ink, tree_hues))
    sky_top, sky_bottom = SKIES[phase]
    # A little atmospheric haze softens only the hill colors.
    def haze(color):
        rgb = [int(color[i:i+2], 16) for i in (1, 3, 5)]
        sky = [int(sky_bottom[i:i+2], 16) for i in (1, 3, 5)]
        return '#' + ''.join(f'{round(c*.75+t*.25):02x}' for c, t in zip(rgb, sky))
    far, middle = map(haze, (far, middle))
    winter = season == 'winter'
    out = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1050" fill="none"><defs>'
           f'<linearGradient id="sky" x2="0" y2="1"><stop stop-color="{sky_top}"/><stop offset="1" stop-color="{sky_bottom}"/></linearGradient>'
           '<filter id="paper"><feTurbulence type="fractalNoise" baseFrequency=".6" numOctaves="3" stitchTiles="stitch"/>'
           '<feColorMatrix type="saturate" values="0"/></filter></defs>'
           '<path fill="url(#sky)" d="M0 0h1600v1050H0z"/>']
    if phase == 'night':
        rng = random.Random(7)
        out.append('<g fill="#faf1d6" opacity=".85">')
        for _ in range(42):
            x, y = rng.randint(30, 1570), rng.randint(35, 490)
            out.append(f'<circle cx="{x}" cy="{y}" r="{rng.choice([1.2,1.6,2])}"/>')
        out.append('<path d="M1294 120a65 65 0 1 0 18 113 57 57 0 0 1-18-113Z"/></g>')
    else:
        x, y = 1255, 185
        out.append(f'<circle cx="{x}" cy="{y}" r="62" fill="#edbd60" stroke="#d6a653" stroke-width="1.5" opacity="1"/>')
        out.append('<path d="M310 199q9-7 17 1q8-8 17-4m19-16q6-5 12 1q6-6 13-3m756 153q8-6 16 1q8-7 16-3" stroke="#465b65" stroke-width="2.5" stroke-linecap="round"/>')
    sky_end = len(out)
    # A distant, low-contrast ridge stays within the bottom landscape band.
    out.append(f'<path d="M-100 900C60 900 165 795 275 795C395 795 465 884 565 884C690 884 775 788 885 788C1010 788 1080 866 1185 866C1310 866 1405 801 1510 801C1595 801 1640 857 1700 879V1150H-100Z" fill="{middle}" opacity=".30"/>')
    # Distant woodland: bottoms disappear into the foreground hill, rather than ending mid-air.
    rng = random.Random(13)
    previous_height = 0
    previous_top = 0
    for index, nominal_x in enumerate(range(-40, 1660, 43)):
        x = nominal_x + rng.randint(-10, 10)
        # Avoid adjacent crowns lining up, including on a sloping hillside.
        for _ in range(40):
            height = rng.randint(80, 210)
            top = ground_height(x + height*.28) - height*.86
            if abs(height-previous_height) > 30 and abs(top-previous_top) > 24:
                break
        previous_height, previous_top = height, top
        y = ground_height(x + height*.28) + 8 - height*318/320
        out.append(tree(x, y, height, tree_hues[(index * 3 + index // 4) % len(tree_hues)], winter, x))
    out.append('<g transform="translate(0 65)">')
    out.append(f'<path d="M-100 923C120 836 236 877 390 911S655 947 800 922S1064 861 1220 890S1462 934 1700 866V1150H-100Z" fill="{leaves}"/>')
    # Clip the distant end to the hillside so there is no flat cap or gap.
    out.append('<defs><clipPath id="path-hillside"><path d="M-100 923C120 836 236 877 390 911S655 947 800 922S1064 861 1220 890S1462 934 1700 866V1150H-100Z"/></clipPath></defs>')
    out.append(f'<path id="hiking-path" clip-path="url(#path-hillside)" d="M784 914C746 953 706 991 674 1050H794C778 996 784 957 795 914Z" fill="{earth}"/>')
    out.append('</g>')
    for x,y,h,i in [(-50,700,400,0),(95,810,290,1),(245,888,220,2),(1300,837,290,1),(1430,720,400,2),(1540,860,310,3)]:
        out.append(tree(x,y+155,h,tree_hues[(i + x // 100) % len(tree_hues)],winter,i))
    terrain = ''.join(out[sky_end:])
    (OUT / f'trail-{season}-{phase}-sky.svg').write_text(''.join(out[:sky_end]) + '</svg>')
    (OUT / f'trail-{season}-{phase}-terrain.svg').write_text('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 770 1600 280" preserveAspectRatio="none" fill="none">' + terrain + '</svg>')
    out.append('<path d="M0 0h1600v1050H0z" filter="url(#paper)" opacity=".045" style="mix-blend-mode:multiply"/></svg>')
    return ''.join(out)

for season in PALETTES:
    for phase in SKIES:
        (OUT / f'trail-{season}-{phase}.svg').write_text(build(season, phase))
(OUT / 'trail-landscape.svg').write_text(build('summer', 'day'))
