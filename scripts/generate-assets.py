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

def draw_waffle_initbtn_character(size=512):
    """
    Simple, cute 'waffle + initbtn' keycap mascot:
    - Rounded keyboard keycap base with warm honey/amber waffle grid
    - No heavy butter (removed as requested)
    - Big, sparkling, adorable expressive eyes
    - Clear, clean cyan reset arrow symbol (⟲) in center
    """
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    pad = int(size * 0.08)
    r = int(size * 0.24)
    
    # 1. Outer Keycap Base (#0f172a slate body with glowing cyan border)
    draw.rounded_rectangle(
        [pad, pad, size - pad, size - pad],
        radius=r,
        fill=(15, 23, 42, 255),
        outline=(56, 189, 248, 240),
        width=int(size * 0.024)
    )
    
    # 2. Waffle Biscuit Face (#f59e0b warm golden amber)
    inner_pad = int(size * 0.15)
    inner_r = int(size * 0.18)
    draw.rounded_rectangle(
        [inner_pad, inner_pad, size - inner_pad, size - inner_pad],
        radius=inner_r,
        fill=(245, 158, 11, 255),
        outline=(217, 119, 6, 255),
        width=int(size * 0.015)
    )
    
    # 3. Simple Waffle Grid Pockets (subtle indented pockets on sides)
    pocket_w = int(size * 0.09)
    pocket_h = int(size * 0.09)
    pocket_r = int(size * 0.02)
    pockets = [
        (inner_pad + int(size * 0.04), inner_pad + int(size * 0.04)),
        (size - inner_pad - pocket_w - int(size * 0.04), inner_pad + int(size * 0.04)),
        (inner_pad + int(size * 0.04), size - inner_pad - pocket_h - int(size * 0.04)),
        (size - inner_pad - pocket_w - int(size * 0.04), size - inner_pad - pocket_h - int(size * 0.04)),
    ]
    for px, py in pockets:
        draw.rounded_rectangle([px, py, px + pocket_w, py + pocket_h], radius=pocket_r, fill=(217, 119, 6, 255))
        draw.rounded_rectangle([px + 2, py + 2, px + pocket_w - 2, py + pocket_h - 2], radius=pocket_r - 1, fill=(180, 83, 9, 255))
    
    cx = size // 2
    cy = size // 2
    
    # 4. Big, Adorable, Expressive Eyes (Clean anime/mascot style)
    eye_offset_x = int(size * 0.16)
    eye_y = cy + int(size * 0.02)
    eye_w = int(size * 0.095)
    eye_h = int(size * 0.13)
    
    # Left Eye
    left_x = cx - eye_offset_x
    draw.ellipse([left_x - eye_w, eye_y - eye_h, left_x + eye_w, eye_y + eye_h], fill=(15, 23, 42, 255))
    # Big sparkling catchlight
    draw.ellipse([left_x - int(eye_w * 0.65), eye_y - int(eye_h * 0.7), left_x + int(eye_w * 0.25), eye_y - int(eye_h * 0.05)], fill=(255, 255, 255, 255))
    # Lower gentle reflection
    draw.ellipse([left_x + int(eye_w * 0.1), eye_y + int(eye_h * 0.25), left_x + int(eye_w * 0.55), eye_y + int(eye_h * 0.65)], fill=(255, 255, 255, 220))
    
    # Right Eye
    right_x = cx + eye_offset_x
    draw.ellipse([right_x - eye_w, eye_y - eye_h, right_x + eye_w, eye_y + eye_h], fill=(15, 23, 42, 255))
    draw.ellipse([right_x - int(eye_w * 0.65), eye_y - int(eye_h * 0.7), right_x + int(eye_w * 0.25), eye_y - int(eye_h * 0.05)], fill=(255, 255, 255, 255))
    draw.ellipse([right_x + int(eye_w * 0.1), eye_y + int(eye_h * 0.25), right_x + int(eye_w * 0.55), eye_y + int(eye_h * 0.65)], fill=(255, 255, 255, 220))
    
    # 5. Soft Rosy Cheeks
    cheek_r = int(size * 0.045)
    cheek_y = eye_y + int(size * 0.09)
    draw.ellipse([left_x - int(eye_w * 1.05) - cheek_r, cheek_y - int(cheek_r * 0.5), left_x - int(eye_w * 1.05) + cheek_r, cheek_y + int(cheek_r * 0.5)], fill=(239, 68, 68, 90))
    draw.ellipse([right_x + int(eye_w * 1.05) - cheek_r, cheek_y - int(cheek_r * 0.5), right_x + int(eye_w * 1.05) + cheek_r, cheek_y + int(cheek_r * 0.5)], fill=(239, 68, 68, 90))
    
    # 6. Center Top: Clean 'initbtn' Reset Symbol (⟲)
    symbol_y = cy - int(size * 0.19)
    arc_r = int(size * 0.07)
    arc_box = [cx - arc_r, symbol_y - arc_r, cx + arc_r, symbol_y + arc_r]
    # Dark badge pocket behind symbol
    draw.rounded_rectangle([cx - arc_r - 6, symbol_y - arc_r - 6, cx + arc_r + 6, symbol_y + arc_r + 6], radius=int(size * 0.03), fill=(15, 23, 42, 220))
    draw.arc(arc_box, start=45, end=315, fill=(56, 189, 248, 255), width=int(size * 0.022))
    
    arrow_size = int(size * 0.028)
    arrow_tip_x = cx + int(arc_r * math.cos(math.radians(45)))
    arrow_tip_y = symbol_y - int(arc_r * math.sin(math.radians(45)))
    draw.polygon([
        (arrow_tip_x, arrow_tip_y - arrow_size),
        (arrow_tip_x + arrow_size, arrow_tip_y + int(arrow_size * 0.6)),
        (arrow_tip_x - int(arrow_size * 0.4), arrow_tip_y + int(arrow_size * 0.3))
    ], fill=(56, 189, 248, 255))
    
    # 7. Gentle, Friendly Smile
    mouth_y = cy + int(size * 0.16)
    mouth_w = int(size * 0.045)
    draw.arc([cx - mouth_w, mouth_y - mouth_w, cx + mouth_w, mouth_y + mouth_w], start=15, end=165, fill=(15, 23, 42, 255), width=int(size * 0.015))

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
    pill_text = "⚡ DOMLOG | TECH BLOG"
    pill_x, pill_y = 80, 75
    draw.rounded_rectangle([pill_x, pill_y, pill_x + 230, pill_y + 36], radius=18, fill=(15, 23, 42, 220), outline=(56, 189, 248, 180), width=1)
    draw.text((pill_x + 22, pill_y + 9), pill_text, font=pill_font, fill=(56, 189, 248, 255))
    
    title_font = get_font(FONT_BOLD, 52)
    draw.text((80, 138), "domlog", font=title_font, fill=(248, 250, 252, 255))
    
    sub_title_font = get_font(FONT_BOLD, 28)
    draw.text((80, 215), "개발 이야기 & 트러블슈팅 기록", font=sub_title_font, fill=(56, 189, 248, 255))
    
    desc_font = get_font(FONT_REGULAR, 21)
    draw.text((80, 275), "WAS 게이트웨이 보안, GIS 데이터 처리, AI 어시스턴트 등", font=desc_font, fill=(203, 213, 225, 255))
    draw.text((80, 312), "실무에서 부딪힌 문제와 해결 과정을 편안하게 정리합니다.", font=desc_font, fill=(148, 163, 184, 255))
    
    badges = [
        ("WAS 보안", (244, 63, 94)),
        ("해양 GIS 10Hz", (56, 189, 248)),
        ("Next.js 16", (255, 255, 255)),
        ("AI Agent", (168, 85, 247)),
        ("waffle", (245, 158, 11)),
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
    
    v_box = [card_x + 60, card_y + target_size - 22, card_x + target_size - 60, card_y + target_size + 18]
    draw.rounded_rectangle(v_box, radius=12, fill=(15, 23, 42, 245), outline=(56, 189, 248, 220), width=2)
    v_font = get_font(FONT_BOLD, 15)
    draw.text((v_box[0] + 16, v_box[1] + 9), "WAFFLE · INITBTN", font=v_font, fill=(56, 189, 248, 255))
    
    out_path = os.path.join(PUBLIC_DIR, "og-image.png")
    img.save(out_path, "PNG", optimize=True)
    print(f"Generated {out_path} ({width}x{height})")

def generate_svg_favicon():
    svg_content = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect x="6" y="6" width="88" height="88" rx="22" fill="#0f172a" stroke="#38bdf8" stroke-width="4"/>
  <rect x="18" y="18" width="64" height="64" rx="16" fill="#f59e0b"/>
  <!-- Pockets -->
  <rect x="23" y="23" width="12" height="12" rx="3" fill="#b45309"/>
  <rect x="65" y="23" width="12" height="12" rx="3" fill="#b45309"/>
  <rect x="23" y="65" width="12" height="12" rx="3" fill="#b45309"/>
  <rect x="65" y="65" width="12" height="12" rx="3" fill="#b45309"/>
  <!-- Big Eyes -->
  <ellipse cx="37" cy="52" rx="7" ry="10" fill="#0f172a"/>
  <ellipse cx="35" cy="48" rx="3" ry="4" fill="#ffffff"/>
  <ellipse cx="63" cy="52" rx="7" ry="10" fill="#0f172a"/>
  <ellipse cx="61" cy="48" rx="3" ry="4" fill="#ffffff"/>
  <!-- Reset Key symbol (initbtn) -->
  <circle cx="50" cy="30" r="10" fill="#0f172a"/>
  <path d="M 50 24 A 6 6 0 1 1 45 27" fill="none" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round"/>
  <polygon points="45,23 45,29 41,26" fill="#38bdf8"/>
</svg>"""
    svg_path = os.path.join(PUBLIC_DIR, "favicon.svg")
    with open(svg_path, "w", encoding="utf-8") as f:
        f.write(svg_content)
    print(f"Generated {svg_path}")

if __name__ == "__main__":
    avatar = draw_waffle_initbtn_character(512)
    generate_icons(avatar)
    generate_og_image(avatar)
    generate_svg_favicon()
