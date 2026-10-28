#!/usr/bin/env python3
import os
import math
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageOps

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUBLIC_DIR = os.path.join(BASE_DIR, "public")
os.makedirs(PUBLIC_DIR, exist_ok=True)

# Fonts
FONT_BOLD = "/usr/share/fonts/truetype/nanum/NanumSquareB.ttf"
FONT_REGULAR = "/usr/share/fonts/truetype/nanum/NanumSquareR.ttf"
FONT_NOTO_BOLD = "/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc"

def get_font(path, size):
    try:
        return ImageFont.truetype(path, size)
    except Exception:
        return ImageFont.load_default()

def draw_waffle_character(size=512):
    """
    Generate the 'Waffle Key' (initbtn + waffle) avatar.
    A rounded keyboard switch keycap + golden crispy waffle grid with glowing butter & reset power loop.
    """
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    pad = int(size * 0.06)
    r = int(size * 0.22)
    
    # 1. Outer Keycap Base (#0f172a to #1e293b dark slate)
    draw.rounded_rectangle([pad, pad, size - pad, size - pad], radius=r, fill=(15, 23, 42, 255), outline=(56, 189, 248, 220), width=int(size * 0.02))
    
    # 2. Inner Keycap bevel / recess
    inner_pad = int(size * 0.12)
    inner_r = int(size * 0.16)
    draw.rounded_rectangle([inner_pad, inner_pad, size - inner_pad, size - inner_pad], radius=inner_r, fill=(24, 33, 54, 255), outline=(30, 41, 59, 255), width=int(size * 0.015))
    
    # 3. Golden Crispy Waffle Body (#f59e0b to #d97706 warm amber)
    waffle_pad = int(size * 0.18)
    waffle_r = int(size * 0.14)
    waffle_box = [waffle_pad, waffle_pad, size - waffle_pad, size - waffle_pad]
    draw.rounded_rectangle(waffle_box, radius=waffle_r, fill=(245, 158, 11, 255), outline=(180, 83, 9, 255), width=int(size * 0.015))
    
    # 4. Waffle Grids (3x3 indented pockets with deep caramel shadow)
    grid_start = waffle_pad + int(size * 0.05)
    grid_end = size - waffle_pad - int(size * 0.05)
    step = (grid_end - grid_start) / 3
    hole_size = step * 0.72
    pocket_r = int(size * 0.035)
    
    for row in range(3):
        for col in range(3):
            # Center pocket is reserved for the 'init/reset' power glyph
            if row == 1 and col == 1:
                continue
            x1 = grid_start + col * step + (step - hole_size) / 2
            y1 = grid_start + row * step + (step - hole_size) / 2
            x2 = x1 + hole_size
            y2 = y1 + hole_size
            # Pocket deep shadow
            draw.rounded_rectangle([x1, y1, x2, y2], radius=pocket_r, fill=(180, 83, 9, 255))
            # Inner highlight
            draw.rounded_rectangle([x1 + 3, y1 + 3, x2 - 2, y2 - 2], radius=pocket_r - 2, fill=(217, 119, 6, 255))
            
    # 5. Center Power / Init Reset Glyph (initbtn symbol ⟲ in cyan glow)
    cx = size // 2
    cy = size // 2
    center_hole_size = step * 0.85
    hx1 = cx - center_hole_size / 2
    hy1 = cy - center_hole_size / 2
    hx2 = cx + center_hole_size / 2
    hy2 = cy + center_hole_size / 2
    # Deep core pocket
    draw.rounded_rectangle([hx1, hy1, hx2, hy2], radius=pocket_r + 2, fill=(15, 23, 42, 255), outline=(56, 189, 248, 255), width=int(size * 0.01))
    
    # Reset loop arc (around center)
    arc_radius = int(center_hole_size * 0.32)
    arc_box = [cx - arc_radius, cy - arc_radius, cx + arc_radius, cy + arc_radius]
    draw.arc(arc_box, start=45, end=315, fill=(56, 189, 248, 255), width=int(size * 0.02))
    
    # Reset arrow head
    arrow_size = int(size * 0.028)
    arrow_tip_x = cx + int(arc_radius * math.cos(math.radians(45)))
    arrow_tip_y = cy - int(arc_radius * math.sin(math.radians(45)))
    draw.polygon([
        (arrow_tip_x, arrow_tip_y - arrow_size),
        (arrow_tip_x + arrow_size, arrow_tip_y + int(arrow_size * 0.6)),
        (arrow_tip_x - int(arrow_size * 0.4), arrow_tip_y + int(arrow_size * 0.3))
    ], fill=(56, 189, 248, 255))
    
    # 6. Melting Butter Cube on top-right (#fef08a with soft rounded corners)
    butter_w = int(size * 0.16)
    butter_h = int(size * 0.13)
    bx1 = size - waffle_pad - butter_w - int(size * 0.04)
    by1 = waffle_pad + int(size * 0.04)
    draw.rounded_rectangle([bx1, by1, bx1 + butter_w, by1 + butter_h], radius=int(size * 0.03), fill=(254, 240, 138, 255), outline=(234, 179, 8, 255), width=2)
    # Butter glaze highlight
    draw.rounded_rectangle([bx1 + 4, by1 + 4, bx1 + butter_w - 6, by1 + int(butter_h * 0.45)], radius=int(size * 0.015), fill=(255, 255, 255, 200))
    
    # 7. Cute Waffle Character Eyes (Friendly, modern, minimal)
    eye_y = cy - int(size * 0.04)
    eye_r = int(size * 0.022)
    # Left eye
    draw.ellipse([cx - int(size * 0.19) - eye_r, eye_y - eye_r, cx - int(size * 0.19) + eye_r, eye_y + eye_r], fill=(15, 23, 42, 255))
    draw.ellipse([cx - int(size * 0.19) - int(eye_r * 0.4), eye_y - int(eye_r * 0.7), cx - int(size * 0.19) + int(eye_r * 0.5), eye_y + int(eye_r * 0.2)], fill=(255, 255, 255, 255))
    
    # Right eye
    draw.ellipse([cx + int(size * 0.19) - eye_r, eye_y - eye_r, cx + int(size * 0.19) + eye_r, eye_y + eye_r], fill=(15, 23, 42, 255))
    draw.ellipse([cx + int(size * 0.19) - int(eye_r * 0.4), eye_y - int(eye_r * 0.7), cx + int(size * 0.19) + int(eye_r * 0.5), eye_y + int(eye_r * 0.2)], fill=(255, 255, 255, 255))

    return img

def generate_icons(waffle_avatar):
    # 1. Avatar (512x512)
    avatar_path = os.path.join(PUBLIC_DIR, "avatar.png")
    waffle_avatar.save(avatar_path, "PNG", optimize=True)
    print(f"Generated {avatar_path} (512x512)")
    
    # 2. apple-touch-icon.png (180x180)
    apple_icon = waffle_avatar.resize((180, 180), Image.Resampling.LANCZOS)
    apple_path = os.path.join(PUBLIC_DIR, "apple-touch-icon.png")
    apple_icon.save(apple_path, "PNG", optimize=True)
    print(f"Generated {apple_path} (180x180)")
    
    # 3. favicon.ico (multi-size 16, 32, 48)
    ico_path = os.path.join(PUBLIC_DIR, "favicon.ico")
    waffle_avatar.save(ico_path, format="ICO", sizes=[(16, 16), (32, 32), (48, 48)])
    print(f"Generated {ico_path} (16, 32, 48 ico)")

def generate_og_image(waffle_avatar):
    width = 1200
    height = 630
    
    # 1. Base Gradient Canvas (#090d16 -> #1e293b)
    img = Image.new("RGBA", (width, height), (9, 13, 22, 255))
    draw = ImageDraw.Draw(img)
    
    for y in range(height):
        ratio = y / height
        r = int(9 + (30 - 9) * ratio)
        g = int(13 + (41 - 13) * ratio)
        b = int(22 + (59 - 22) * ratio)
        draw.line([(0, y), (width, y)], fill=(r, g, b, 255))
        
    # Ambient Glow
    glow_canvas = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow_canvas)
    glow_draw.ellipse([(-100, -100), (500, 500)], fill=(56, 189, 248, 35))
    glow_draw.ellipse([(750, 250), (1350, 850)], fill=(245, 158, 11, 28))
    glow_canvas = glow_canvas.filter(ImageFilter.GaussianBlur(90))
    img = Image.alpha_composite(img, glow_canvas)
    draw = ImageDraw.Draw(img)
    
    # Engineering Grid Lines
    grid_color = (255, 255, 255, 12)
    for x in range(0, width, 60):
        draw.line([(x, 0), (x, height)], fill=grid_color, width=1)
    for y in range(0, height, 60):
        draw.line([(0, y), (width, y)], fill=grid_color, width=1)
        
    # Subtle Outer Border
    draw.rectangle([(12, 12), (width - 12, height - 12)], outline=(56, 189, 248, 60), width=1)
    
    # 2. Left Content
    # Category Pill
    pill_font = get_font(FONT_BOLD, 15)
    pill_text = "⚡ DOMLOG | ENGINEERING JOURNAL"
    pill_x, pill_y = 80, 75
    draw.rounded_rectangle([pill_x, pill_y, pill_x + 310, pill_y + 36], radius=18, fill=(15, 23, 42, 220), outline=(56, 189, 248, 180), width=1)
    draw.text((pill_x + 22, pill_y + 9), pill_text, font=pill_font, fill=(56, 189, 248, 255))
    
    # Main Headline
    title_font = get_font(FONT_BOLD, 52)
    draw.text((80, 138), "domlog", font=title_font, fill=(248, 250, 252, 255))
    
    sub_title_font = get_font(FONT_BOLD, 30)
    draw.text((80, 215), "소프트웨어 엔지니어링 & 시스템 아키텍처", font=sub_title_font, fill=(56, 189, 248, 255))
    
    # Description
    desc_font = get_font(FONT_REGULAR, 21)
    draw.text((80, 275), "클라이언트 제로 트러스트 WAS 게이트웨이 · 10Hz 해양 GIS 엔진", font=desc_font, fill=(203, 213, 225, 255))
    draw.text((80, 312), "온디바이스 sLM RAG 파이프라인과 실전 트러블슈팅의 기록", font=desc_font, fill=(148, 163, 184, 255))
    
    # Topic Badges
    badges = [
        ("Zero Trust WAS", (244, 63, 94)),
        ("Marine GIS 10Hz", (56, 189, 248)),
        ("Next.js 16 App Router", (255, 255, 255)),
        ("sLM AI Agent", (168, 85, 247)),
        ("waffle & initbtn", (245, 158, 11)),
        ("Vitest TDD", (252, 203, 59)),
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
        
    # Footer Domain
    url_font = get_font(FONT_REGULAR, 19)
    draw.text((80, 545), "🔗 https://domlog.vercel.app", font=url_font, fill=(148, 163, 184, 255))
    
    # 3. Right Avatar Card
    target_size = 350
    prof_img = waffle_avatar.resize((target_size, target_size), Image.Resampling.LANCZOS)
    
    card_x = 765
    card_y = 125
    
    # Frame container
    draw.rounded_rectangle([card_x - 8, card_y - 8, card_x + target_size + 8, card_y + target_size + 8], radius=36, fill=(15, 23, 42, 220), outline=(245, 158, 11, 140), width=2)
    img.paste(prof_img, (card_x, card_y), prof_img)
    
    # Character Title Tag Below Avatar
    v_box = [card_x + 40, card_y + target_size - 22, card_x + target_size - 40, card_y + target_size + 18]
    draw.rounded_rectangle(v_box, radius=12, fill=(15, 23, 42, 245), outline=(56, 189, 248, 220), width=2)
    v_font = get_font(FONT_BOLD, 15)
    draw.text((v_box[0] + 24, v_box[1] + 9), "WAFFLE KEY (initbtn)", font=v_font, fill=(56, 189, 248, 255))
    
    out_path = os.path.join(PUBLIC_DIR, "og-image.png")
    img.save(out_path, "PNG", optimize=True)
    print(f"Generated {out_path} ({width}x{height})")

def generate_svg_favicon():
    svg_content = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect x="6" y="6" width="88" height="88" rx="20" fill="#0f172a" stroke="#38bdf8" stroke-width="4"/>
  <rect x="18" y="18" width="64" height="64" rx="14" fill="#f59e0b" stroke="#b45309" stroke-width="3"/>
  <rect x="25" y="25" width="14" height="14" rx="3" fill="#b45309"/>
  <rect x="61" y="25" width="14" height="14" rx="3" fill="#b45309"/>
  <rect x="25" y="61" width="14" height="14" rx="3" fill="#b45309"/>
  <rect x="61" y="61" width="14" height="14" rx="3" fill="#b45309"/>
  <!-- Center Reset Key -->
  <rect x="38" y="38" width="24" height="24" rx="5" fill="#0f172a" stroke="#38bdf8" stroke-width="2"/>
  <path d="M 50 42 A 6 6 0 1 1 45 45" fill="none" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round"/>
  <polygon points="45,41 45,47 41,44" fill="#38bdf8"/>
  <!-- Butter on top-right -->
  <rect x="56" y="20" width="18" height="14" rx="3" fill="#fef08a" stroke="#eab308" stroke-width="1.5"/>
</svg>"""
    svg_path = os.path.join(PUBLIC_DIR, "favicon.svg")
    with open(svg_path, "w", encoding="utf-8") as f:
        f.write(svg_content)
    print(f"Generated {svg_path}")

if __name__ == "__main__":
    avatar = draw_waffle_character(512)
    generate_icons(avatar)
    generate_og_image(avatar)
    generate_svg_favicon()
