#!/usr/bin/env python3
import os
import math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUBLIC_DIR = os.path.join(BASE_DIR, "public")
APP_DIR = os.path.join(BASE_DIR, "src", "app")
os.makedirs(PUBLIC_DIR, exist_ok=True)
os.makedirs(APP_DIR, exist_ok=True)

# Fonts
FONT_BOLD = "/usr/share/fonts/truetype/nanum/NanumSquareB.ttf"
FONT_REGULAR = "/usr/share/fonts/truetype/nanum/NanumSquareR.ttf"

def get_font(path, size):
    try:
        return ImageFont.truetype(path, size)
    except Exception:
        return ImageFont.load_default()

def draw_pure_waffle_avatar(size=512):
    """
    Pure Bold Waffle Keycap Avatar:
    - Pure Waffle only (initbtn reset arrow symbol completely removed).
    - Vivid, warm Honey Gold (#fbbf24) & Rich Maple Amber (#b45309).
    - Crisp, thick 3x3 waffle grid matrix:
      Represents modular architecture, low coupling & high cohesion.
    - Deep mechanical keycap switch base (#0f172a slate with cyan chamfer).
    - High contrast, clearly readable even at 16x16 / 32x32 favicon scale!
    """
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    pad = int(size * 0.06)
    r = int(size * 0.22)
    
    # 1. Outer Mechanical Keycap Base (#0f172a slate body with glowing cyan border)
    draw.rounded_rectangle(
        [pad, pad, size - pad, size - pad],
        radius=r,
        fill=(15, 23, 42, 255),
        outline=(56, 189, 248, 240),
        width=int(size * 0.024)
    )
    
    # 2. Keycap Bevel / Angled Slope
    slope_pad = int(size * 0.12)
    slope_r = int(size * 0.17)
    draw.rounded_rectangle(
        [slope_pad, slope_pad, size - slope_pad, size - slope_pad],
        radius=slope_r,
        fill=(24, 33, 54, 255),
        outline=(30, 41, 59, 255),
        width=int(size * 0.012)
    )
    
    # 3. Vivid Honey Gold Waffle Face (#fbbf24)
    plate_pad = int(size * 0.16)
    plate_r = int(size * 0.13)
    draw.rounded_rectangle(
        [plate_pad, plate_pad, size - plate_pad, size - plate_pad],
        radius=plate_r,
        fill=(251, 191, 36, 255),
        outline=(217, 119, 6, 255),
        width=int(size * 0.016)
    )
    
    # 4. Bold 3x3 Waffle Grid (All 9 pockets cleanly indented with deep caramel shadow)
    grid_start = plate_pad + int(size * 0.04)
    grid_end = size - plate_pad - int(size * 0.04)
    step = (grid_end - grid_start) / 3
    hole_size = step * 0.76
    pocket_r = int(size * 0.035)
    
    for row in range(3):
        for col in range(3):
            x1 = grid_start + col * step + (step - hole_size) / 2
            y1 = grid_start + row * step + (step - hole_size) / 2
            x2 = x1 + hole_size
            y2 = y1 + hole_size
            
            # Deep maple amber recessed cavity
            draw.rounded_rectangle([x1, y1, x2, y2], radius=pocket_r, fill=(180, 83, 9, 255))
            # Subtle warm inner highlight
            draw.rounded_rectangle([x1 + 3, y1 + 3, x2 - 2, y2 - 2], radius=pocket_r - 2, fill=(217, 119, 6, 255))
            
            # Center pocket gets an extra crisp waffle core highlight
            if row == 1 and col == 1:
                draw.rounded_rectangle([x1 + 6, y1 + 6, x2 - 6, y2 - 6], radius=pocket_r - 3, fill=(245, 158, 11, 255))
                # Micro dot in center
                cx = (x1 + x2) / 2
                cy = (y1 + y2) / 2
                draw.ellipse([cx - 4, cy - 4, cx + 4, cy + 4], fill=(254, 240, 138, 255))

    return img

def generate_icons(avatar):
    # 1. Avatar (512x512)
    avatar_path = os.path.join(PUBLIC_DIR, "avatar.png")
    avatar.save(avatar_path, "PNG", optimize=True)
    print(f"Generated {avatar_path} (512x512)")
    
    # 2. apple-touch-icon.png (180x180)
    apple_icon = avatar.resize((180, 180), Image.Resampling.LANCZOS)
    apple_path = os.path.join(PUBLIC_DIR, "apple-touch-icon.png")
    apple_icon.save(apple_path, "PNG", optimize=True)
    print(f"Generated {apple_path} (180x180)")
    
    # 3. favicon.ico (multi-size 16, 32, 48) in BOTH public/ and src/app/
    ico_path = os.path.join(PUBLIC_DIR, "favicon.ico")
    avatar.save(ico_path, format="ICO", sizes=[(16, 16), (32, 32), (48, 48)])
    
    app_ico_path = os.path.join(APP_DIR, "favicon.ico")
    avatar.save(app_ico_path, format="ICO", sizes=[(16, 16), (32, 32), (48, 48)])
    print(f"Generated {ico_path} and {app_ico_path} (16, 32, 48 ico)")

def generate_og_image(avatar):
    """
    Requested Layout:
    - Left: Large, crisp Waffle Keycap Profile Avatar
    - Right: Clean, elegant Typography (Brand, Title, Tagline, Domain)
    - Background: Subtle engineering grid pattern with ambient cyan/amber glow
    - 1200x630 standard card
    """
    width = 1200
    height = 630
    
    img = Image.new("RGBA", (width, height), (9, 13, 22, 255))
    draw = ImageDraw.Draw(img)
    
    # Subtle dark background gradient
    for y in range(height):
        ratio = y / height
        r = int(9 + (26 - 9) * ratio)
        g = int(13 + (36 - 13) * ratio)
        b = int(22 + (52 - 22) * ratio)
        draw.line([(0, y), (width, y)], fill=(r, g, b, 255))
        
    # Ambient radial light: amber glow near avatar on left, sky glow on right
    glow_canvas = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow_canvas)
    glow_draw.ellipse([(80, 80), (580, 550)], fill=(245, 158, 11, 20))
    glow_draw.ellipse([(700, 80), (1200, 580)], fill=(56, 189, 248, 18))
    glow_canvas = glow_canvas.filter(ImageFilter.GaussianBlur(90))
    img = Image.alpha_composite(img, glow_canvas)
    draw = ImageDraw.Draw(img)
    
    # Engineering Grid Lines (40px) - very subtle to keep text crystal-clear
    grid_color = (255, 255, 255, 6)
    for x in range(0, width, 50):
        draw.line([(x, 0), (x, height)], fill=grid_color, width=1)
    for y in range(0, height, 50):
        draw.line([(0, y), (width, y)], fill=grid_color, width=1)
        
    # Outer Border
    draw.rectangle([(16, 16), (width - 16, height - 16)], outline=(56, 189, 248, 40), width=1)
    
    # ── LEFT: Large Waffle Keycap Avatar ──
    avatar_size = 400
    avatar_resized = avatar.resize((avatar_size, avatar_size), Image.Resampling.LANCZOS)
    avatar_x = 90
    avatar_y = (height - avatar_size) // 2
    
    # Elevated Frame Container behind avatar
    draw.rounded_rectangle(
        [avatar_x - 10, avatar_y - 10, avatar_x + avatar_size + 10, avatar_y + avatar_size + 10],
        radius=44,
        fill=(13, 20, 36, 245),
        outline=(56, 189, 248, 160),
        width=2
    )
    img.paste(avatar_resized, (avatar_x, avatar_y), avatar_resized)
    
    # ── RIGHT: Clean Typography & Role Statement (High Contrast Slate-900 Glass Card) ──
    card_x = 540
    card_y = 110
    card_w = 600
    card_h = 410
    # Text card backdrop panel for maximum contrast against grid
    draw.rounded_rectangle(
        [card_x, card_y, card_x + card_w, card_y + card_h],
        radius=28,
        fill=(13, 20, 36, 235),
        outline=(56, 189, 248, 90),
        width=1
    )
    
    text_x = card_x + 36
    content_y = card_y + 36
    
    # 1. Category Pill
    pill_font = get_font(FONT_BOLD, 14)
    pill_text = "TECH & ARCHITECTURE JOURNAL"
    pbbox = draw.textbbox((0, 0), pill_text, font=pill_font)
    pw = (pbbox[2] - pbbox[0]) + 28
    draw.rounded_rectangle([text_x, content_y, text_x + pw, content_y + 30], radius=15, fill=(15, 23, 42, 255), outline=(56, 189, 248, 200), width=1)
    draw.text((text_x + 14, content_y + 6), pill_text, font=pill_font, fill=(56, 189, 248, 255))
    
    # 2. Main Brand Name: domlog
    brand_font = get_font(FONT_BOLD, 66)
    draw.text((text_x, content_y + 46), "domlog", font=brand_font, fill=(255, 255, 255, 255))
    
    # 3. Modern Role Headline: Full-Stack & AI Systems Builder
    role_font = get_font(FONT_BOLD, 30)
    draw.text((text_x, content_y + 138), "Full-Stack & AI Systems Builder", font=role_font, fill=(56, 189, 248, 255))
    
    # 4. Value Statement / Description
    desc_font = get_font(FONT_BOLD, 20)
    draw.text((text_x, content_y + 192), "낮은 결합도와 높은 응집도를 갖춘 모듈식 아키텍처", font=desc_font, fill=(241, 245, 249, 255))
    
    desc_sub_font = get_font(FONT_REGULAR, 19)
    draw.text((text_x, content_y + 228), "실무 시스템 엔지니어링과 트러블슈팅의 기록", font=desc_sub_font, fill=(186, 200, 222, 255))
    
    # 5. Domain / Link Footer
    url_font = get_font(FONT_BOLD, 18)
    draw.text((text_x, content_y + 288), "https://domlog.vercel.app", font=url_font, fill=(56, 189, 248, 255))

    out_path = os.path.join(PUBLIC_DIR, "og-image.png")
    img.save(out_path, "PNG", optimize=True)
    print(f"Generated {out_path} ({width}x{height})")

def generate_svg_favicon():
    """
    Crisp SVG Favicon: Pure Honey Gold Waffle with 3x3 Matrix
    """
    svg_content = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect x="6" y="6" width="88" height="88" rx="20" fill="#0f172a" stroke="#38bdf8" stroke-width="4"/>
  <rect x="16" y="16" width="68" height="68" rx="14" fill="#fbbf24" stroke="#d97706" stroke-width="2"/>
  <!-- 3x3 Bold Waffle Grid -->
  <rect x="22" y="22" width="14" height="14" rx="3" fill="#b45309"/>
  <rect x="43" y="22" width="14" height="14" rx="3" fill="#b45309"/>
  <rect x="64" y="22" width="14" height="14" rx="3" fill="#b45309"/>
  <rect x="22" y="43" width="14" height="14" rx="3" fill="#b45309"/>
  <rect x="43" y="43" width="14" height="14" rx="3" fill="#b45309"/>
  <rect x="64" y="43" width="14" height="14" rx="3" fill="#b45309"/>
  <rect x="22" y="64" width="14" height="14" rx="3" fill="#b45309"/>
  <rect x="43" y="64" width="14" height="14" rx="3" fill="#b45309"/>
  <rect x="64" y="64" width="14" height="14" rx="3" fill="#b45309"/>
</svg>"""
    svg_path = os.path.join(PUBLIC_DIR, "favicon.svg")
    with open(svg_path, "w", encoding="utf-8") as f:
        f.write(svg_content)
    print(f"Generated {svg_path}")

if __name__ == "__main__":
    avatar = draw_pure_waffle_avatar(512)
    generate_icons(avatar)
    generate_og_image(avatar)
    generate_svg_favicon()
