#!/usr/bin/env python3
import os
import math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUBLIC_DIR = os.path.join(BASE_DIR, "public")
os.makedirs(PUBLIC_DIR, exist_ok=True)

# Fonts
FONT_BOLD = "/usr/share/fonts/truetype/nanum/NanumSquareB.ttf"
FONT_REGULAR = "/usr/share/fonts/truetype/nanum/NanumSquareR.ttf"

def get_font(path, size):
    try:
        return ImageFont.truetype(path, size)
    except Exception:
        return ImageFont.load_default()

def draw_waffle_keycap_avatar(size=512):
    """
    Technical Simplicity & Architectural Elegance:
    - Isometric/Frontal Mechanical Keyboard Keycap (the 'initbtn' switch)
    - Keycap top surface features a crisp 3x3 waffle grid matrix
      representing low coupling & high cohesion (Clean Architecture)
    - Center keycap recess has a sharp cyan LED reset arrow (⟲)
    - Modern dark slate + warm amber biscuit tone + electric cyan accent
    - Pure engineering simplicity (no overly cartoonish clutter)
    """
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    pad = int(size * 0.08)
    r = int(size * 0.22)
    
    # 1. Outer Keycap Body (Deep Slate #0b1120 with chamfered edge)
    draw.rounded_rectangle(
        [pad, pad, size - pad, size - pad],
        radius=r,
        fill=(15, 23, 42, 255),
        outline=(56, 189, 248, 230),
        width=int(size * 0.022)
    )
    
    # 2. Keycap Bevel / Angled Slope (Upper highlight & bottom shadow)
    slope_pad = int(size * 0.13)
    slope_r = int(size * 0.17)
    draw.rounded_rectangle(
        [slope_pad, slope_pad, size - slope_pad, size - slope_pad],
        radius=slope_r,
        fill=(24, 33, 54, 255),
        outline=(30, 41, 59, 255),
        width=int(size * 0.012)
    )
    
    # 3. Keycap Top Plate: Golden Waffle Biscuit Matrix (#f59e0b)
    plate_pad = int(size * 0.18)
    plate_r = int(size * 0.13)
    draw.rounded_rectangle(
        [plate_pad, plate_pad, size - plate_pad, size - plate_pad],
        radius=plate_r,
        fill=(245, 158, 11, 255),
        outline=(180, 83, 9, 255),
        width=int(size * 0.015)
    )
    
    # 4. 3x3 Keyboard Matrix / Waffle Grid (Clean geometric pockets)
    grid_start = plate_pad + int(size * 0.04)
    grid_end = size - plate_pad - int(size * 0.04)
    step = (grid_end - grid_start) / 3
    hole_size = step * 0.76
    pocket_r = int(size * 0.03)
    
    cx = size // 2
    cy = size // 2
    
    for row in range(3):
        for col in range(3):
            # Center slot is the Core Reset Switch
            if row == 1 and col == 1:
                continue
                
            x1 = grid_start + col * step + (step - hole_size) / 2
            y1 = grid_start + row * step + (step - hole_size) / 2
            x2 = x1 + hole_size
            y2 = y1 + hole_size
            
            # Recessed mechanical key switch pocket (dark amber cavity)
            draw.rounded_rectangle([x1, y1, x2, y2], radius=pocket_r, fill=(180, 83, 9, 255))
            draw.rounded_rectangle([x1 + 3, y1 + 3, x2 - 2, y2 - 2], radius=pocket_r - 2, fill=(217, 119, 6, 255))
            
            # Subtle keycap grid dot
            dot_cx = (x1 + x2) / 2
            dot_cy = (y1 + y2) / 2
            draw.ellipse([dot_cx - 4, dot_cy - 4, dot_cx + 4, dot_cy + 4], fill=(254, 240, 138, 200))
            
    # 5. Center Core: The 'initbtn' Key (Pure Technical Simplicity)
    center_hole_size = step * 0.92
    hx1 = cx - center_hole_size / 2
    hy1 = cy - center_hole_size / 2
    hx2 = cx + center_hole_size / 2
    hy2 = cy + center_hole_size / 2
    
    # Deep slate central switch pocket
    draw.rounded_rectangle(
        [hx1, hy1, hx2, hy2],
        radius=pocket_r + 3,
        fill=(11, 15, 25, 255),
        outline=(56, 189, 248, 255),
        width=int(size * 0.016)
    )
    
    # Sharp Glowing Cyan Reset Loop (⟲)
    arc_radius = int(center_hole_size * 0.32)
    arc_box = [cx - arc_radius, cy - arc_radius, cx + arc_radius, cy + arc_radius]
    draw.arc(arc_box, start=50, end=310, fill=(56, 189, 248, 255), width=int(size * 0.024))
    
    # Crisp Arrow Head
    arrow_size = int(size * 0.032)
    arrow_tip_x = cx + int(arc_radius * math.cos(math.radians(50)))
    arrow_tip_y = cy - int(arc_radius * math.sin(math.radians(50)))
    draw.polygon([
        (arrow_tip_x, arrow_tip_y - arrow_size),
        (arrow_tip_x + arrow_size, arrow_tip_y + int(arrow_size * 0.6)),
        (arrow_tip_x - int(arrow_size * 0.4), arrow_tip_y + int(arrow_size * 0.3))
    ], fill=(56, 189, 248, 255))
    
    # Center subtle core pulse dot
    draw.ellipse([cx - 5, cy - 5, cx + 5, cy + 5], fill=(56, 189, 248, 220))

    return img

def generate_icons(avatar):
    avatar_path = os.path.join(PUBLIC_DIR, "avatar.png")
    avatar.save(avatar_path, "PNG", optimize=True)
    print(f"Generated {avatar_path} (512x512)")
    
    apple_icon = avatar.resize((180, 180), Image.Resampling.LANCZOS)
    apple_path = os.path.join(PUBLIC_DIR, "apple-touch-icon.png")
    apple_icon.save(apple_path, "PNG", optimize=True)
    print(f"Generated {apple_path} (180x180)")
    
    ico_path = os.path.join(PUBLIC_DIR, "favicon.ico")
    avatar.save(ico_path, format="ICO", sizes=[(16, 16), (32, 32), (48, 48)])
    print(f"Generated {ico_path} (16, 32, 48 ico)")

def generate_og_image(avatar):
    width = 1200
    height = 630
    
    img = Image.new("RGBA", (width, height), (9, 13, 22, 255))
    draw = ImageDraw.Draw(img)
    
    for y in range(height):
        ratio = y / height
        r = int(9 + (30 - 9) * ratio)
        g = int(13 + (41 - 13) * ratio)
        b = int(22 + (59 - 22) * ratio)
        draw.line([(0, y), (width, y)], fill=(r, g, b, 255))
        
    glow_canvas = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow_canvas)
    glow_draw.ellipse([(-100, -100), (500, 500)], fill=(56, 189, 248, 35))
    glow_draw.ellipse([(800, 250), (1350, 800)], fill=(245, 158, 11, 25))
    glow_canvas = glow_canvas.filter(ImageFilter.GaussianBlur(90))
    img = Image.alpha_composite(img, glow_canvas)
    draw = ImageDraw.Draw(img)
    
    grid_color = (255, 255, 255, 12)
    for x in range(0, width, 60):
        draw.line([(x, 0), (x, height)], fill=grid_color, width=1)
    for y in range(0, height, 60):
        draw.line([(0, y), (width, y)], fill=grid_color, width=1)
        
    draw.rectangle([(12, 12), (width - 12, height - 12)], outline=(56, 189, 248, 60), width=1)
    
    pill_font = get_font(FONT_BOLD, 15)
    pill_text = "⚡ DOMLOG | TECH & ARCHITECTURE"
    pill_x, pill_y = 80, 75
    draw.rounded_rectangle([pill_x, pill_y, pill_x + 300, pill_y + 36], radius=18, fill=(15, 23, 42, 220), outline=(56, 189, 248, 180), width=1)
    draw.text((pill_x + 22, pill_y + 9), pill_text, font=pill_font, fill=(56, 189, 248, 255))
    
    title_font = get_font(FONT_BOLD, 52)
    draw.text((80, 138), "domlog", font=title_font, fill=(248, 250, 252, 255))
    
    sub_title_font = get_font(FONT_BOLD, 28)
    draw.text((80, 215), "소프트웨어 엔지니어링 & 시스템 아키텍처", font=sub_title_font, fill=(56, 189, 248, 255))
    
    desc_font = get_font(FONT_REGULAR, 21)
    draw.text((80, 275), "낮은 결합도와 높은 응집도를 갖춘 모듈식 객체지향 설계", font=desc_font, fill=(203, 213, 225, 255))
    draw.text((80, 312), "WAS 게이트웨이 보안, 해양 GIS 10Hz, 실무 트러블슈팅의 기록", font=desc_font, fill=(148, 163, 184, 255))
    
    badges = [
        ("Zero Trust WAS", (244, 63, 94)),
        ("해양 GIS 10Hz", (56, 189, 248)),
        ("Waffle Keycap", (245, 158, 11)),
        ("Next.js 16", (255, 255, 255)),
        ("AI Agent", (168, 85, 247)),
        ("initbtn", (56, 189, 248)),
    ]
    
    badge_font = get_font(FONT_BOLD, 16)
    badge_x = 80
    badge_y = 380
    
    for text, dot_color in badges:
        bbox = draw.textbbox((0, 0), text, font=badge_font)
        bw = (bbox[2] - bbox[0]) + 38
        bh = 34
        if badge_x + bw > 730:
            badge_x = 80
            badge_y += 44
        draw.rounded_rectangle([badge_x, badge_y, badge_x + bw, badge_y + bh], radius=8, fill=(30, 41, 59, 220), outline=(51, 65, 85, 255), width=1)
        draw.ellipse([badge_x + 12, badge_y + 12, badge_x + 20, badge_y + 20], fill=dot_color)
        draw.text((badge_x + 28, badge_y + 7), text, font=badge_font, fill=(241, 245, 249, 255))
        badge_x += bw + 10
        
    url_font = get_font(FONT_REGULAR, 19)
    draw.text((80, 545), "🔗 https://domlog.vercel.app  ·  @initbtn", font=url_font, fill=(148, 163, 184, 255))
    
    target_size = 350
    prof_img = avatar.resize((target_size, target_size), Image.Resampling.LANCZOS)
    
    card_x = 765
    card_y = 125
    
    draw.rounded_rectangle([card_x - 8, card_y - 8, card_x + target_size + 8, card_y + target_size + 8], radius=36, fill=(15, 23, 42, 220), outline=(56, 189, 248, 160), width=2)
    img.paste(prof_img, (card_x, card_y), prof_img)
    
    v_box = [card_x + 40, card_y + target_size - 22, card_x + target_size - 40, card_y + target_size + 18]
    draw.rounded_rectangle(v_box, radius=12, fill=(15, 23, 42, 245), outline=(56, 189, 248, 220), width=2)
    v_font = get_font(FONT_BOLD, 15)
    draw.text((v_box[0] + 16, v_box[1] + 9), "WAFFLE KEY (initbtn)", font=v_font, fill=(56, 189, 248, 255))
    
    out_path = os.path.join(PUBLIC_DIR, "og-image.png")
    img.save(out_path, "PNG", optimize=True)
    print(f"Generated {out_path} ({width}x{height})")

def generate_svg_favicon():
    svg_content = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect x="6" y="6" width="88" height="88" rx="22" fill="#0f172a" stroke="#38bdf8" stroke-width="4"/>
  <rect x="18" y="18" width="64" height="64" rx="14" fill="#f59e0b"/>
  <!-- 3x3 Grid Matrix -->
  <rect x="23" y="23" width="14" height="14" rx="3" fill="#b45309"/>
  <rect x="43" y="23" width="14" height="14" rx="3" fill="#b45309"/>
  <rect x="63" y="23" width="14" height="14" rx="3" fill="#b45309"/>
  <rect x="23" y="43" width="14" height="14" rx="3" fill="#b45309"/>
  <!-- Center initbtn key -->
  <rect x="41" y="41" width="18" height="18" rx="4" fill="#0b0f19" stroke="#38bdf8" stroke-width="2"/>
  <path d="M 50 44 A 4.5 4.5 0 1 1 46 47" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linecap="round"/>
  <rect x="63" y="43" width="14" height="14" rx="3" fill="#b45309"/>
  <rect x="23" y="63" width="14" height="14" rx="3" fill="#b45309"/>
  <rect x="43" y="63" width="14" height="14" rx="3" fill="#b45309"/>
  <rect x="63" y="63" width="14" height="14" rx="3" fill="#b45309"/>
</svg>"""
    svg_path = os.path.join(PUBLIC_DIR, "favicon.svg")
    with open(svg_path, "w", encoding="utf-8") as f:
        f.write(svg_content)
    print(f"Generated {svg_path}")

if __name__ == "__main__":
    avatar = draw_waffle_keycap_avatar(512)
    generate_icons(avatar)
    generate_og_image(avatar)
    generate_svg_favicon()
