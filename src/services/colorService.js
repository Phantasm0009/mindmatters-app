/**
 * Service to fetch color palettes from Colormind.io based on mood
 */

const COLORMIND_API = 'http://colormind.io/api/';

/**
 * Get a color palette based on mood
 * @param {string} mood - The mood description (happy, sad, calm, etc)
 * @returns {Promise<Array>} Array of RGB colors
 */
export const getMoodColorPalette = async (mood) => {
  // Skip API calls entirely and use default palettes
  return getDefaultPalette(mood);
};

/**
 * Get a fallback color palette based on mood
 * @param {string} mood - The mood description
 * @returns {Array} Array of RGB colors
 */
const getDefaultPalette = (mood) => {
  // Enhanced color palettes with harmonious combinations for each emotion
  // Each palette is carefully designed for both aesthetic appeal and emotional resonance
  const defaultPalettes = {
    happy: [
      [255, 195, 0],   // Primary: Bright yellow
      [255, 153, 51],  // Secondary: Warm orange
      [255, 87, 51],   // Accent: Coral
      [255, 253, 230], // Background: Cream
      [35, 35, 35]     // Text: Dark gray
    ],
    excited: [
      [255, 89, 94],   // Primary: Coral red
      [255, 130, 67],  // Secondary: Bright orange
      [255, 45, 85],   // Accent: Hot pink
      [255, 245, 245], // Background: Light cream
      [40, 40, 40]     // Text: Near black
    ],
    calm: [
      [86, 161, 200],  // Primary: Sky blue
      [121, 189, 154], // Secondary: Seafoam
      [71, 150, 237],  // Accent: Bright blue
      [240, 248, 255], // Background: Alice blue
      [45, 55, 72]     // Text: Blue-gray
    ],
    relaxed: [
      [106, 177, 135], // Primary: Soft green
      [132, 197, 175], // Secondary: Mint
      [65, 176, 131],  // Accent: Emerald
      [242, 250, 242], // Background: Off-white
      [50, 72, 62]     // Text: Deep green-gray
    ],
    neutral: [
      [190, 190, 190], // Primary: Medium gray
      [160, 160, 170], // Secondary: Blue-gray
      [130, 150, 170], // Accent: Slate
      [246, 246, 246], // Background: Off-white
      [60, 60, 60]     // Text: Dark gray
    ],
    sad: [
      [108, 117, 187], // Primary: Muted blue
      [143, 158, 191], // Secondary: Periwinkle
      [95, 110, 175],  // Accent: Deeper blue
      [240, 245, 250], // Background: Pale blue
      [45, 50, 80]     // Text: Navy blue
    ],
    stressed: [
      [242, 103, 34],  // Primary: Burnt orange
      [236, 139, 94],  // Secondary: Soft orange
      [255, 76, 5],    // Accent: Bright orange
      [252, 247, 240], // Background: Cream
      [60, 36, 21]     // Text: Dark brown
    ],
    angry: [
      [201, 42, 42],   // Primary: Deep red
      [220, 73, 58],   // Secondary: Brick red
      [230, 46, 0],    // Accent: Fiery orange-red
      [253, 241, 240], // Background: Light pink
      [70, 28, 28]     // Text: Dark maroon
    ],
    anxious: [
      [255, 177, 0],   // Primary: Amber
      [255, 201, 71],  // Secondary: Muted gold
      [255, 145, 0],   // Accent: Orange
      [254, 250, 235], // Background: Light cream
      [66, 54, 30]     // Text: Dark brown
    ],
    tired: [
      [147, 112, 170], // Primary: Lavender
      [170, 142, 190], // Secondary: Light purple
      [120, 90, 140],  // Accent: Deep purple
      [246, 243, 248], // Background: Pale lavender
      [60, 45, 70]     // Text: Dark purple
    ],
    grateful: [
      [41, 166, 126],  // Primary: Emerald
      [92, 190, 143],  // Secondary: Light green
      [39, 143, 108],  // Accent: Deep green
      [240, 250, 244], // Background: Pale mint
      [40, 70, 55]     // Text: Forest green
    ]
  };
  
  // Return default palette based on mood, or neutral if mood not found
  return defaultPalettes[mood] || defaultPalettes.neutral;
};

/**
 * Convert RGB array to CSS hex color
 * @param {Array} rgb - [r, g, b] array
 * @returns {string} Hex color string (#RRGGBB)
 */
export const rgbToHex = (rgb) => {
  return '#' + rgb.map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
};

/**
 * Convert RGB array to CSS rgba string
 * @param {Array} rgb - [r, g, b] array
 * @param {number} alpha - Alpha transparency (0-1)
 * @returns {string} RGBA color string
 */
export const rgbToRgba = (rgb, alpha = 1) => {
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;
};

/**
 * Extract text color (white/black) that contrasts with background
 * @param {Array} rgb - Background color as [r, g, b] array
 * @returns {string} '#ffffff' for dark backgrounds or '#333333' for light backgrounds
 */
export const getContrastColor = (rgb) => {
  // Calculate perceived brightness using weighted RGB (YIQ formula)
  // This formula accounts for human perception of color brightness
  const brightness = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
  return brightness > 128 ? '#333333' : '#ffffff';
};

/**
 * Creates a full theme object from a color palette
 * @param {Array} palette - Array of RGB colors from Colormind
 * @returns {Object} Theme object with CSS variables
 */
export const createThemeFromPalette = (palette) => {
  if (!palette || !Array.isArray(palette) || palette.length < 5) {
    console.error('Invalid palette provided to createThemeFromPalette', palette);
    return null;
  }
  
  // Extract colors from palette
  const [primary, secondary, accent, background, text] = palette;
  
  // Determine contrasting text colors
  const onPrimary = getContrastColor(primary);
  const onSecondary = getContrastColor(secondary);
  const onAccent = getContrastColor(accent);
  const onBackground = getContrastColor(background);
  
  // Create lighter and darker variants of primary color
  const primaryLight = primary.map(c => Math.min(255, Math.round(c * 1.2)));
  const primaryDark = primary.map(c => Math.round(c * 0.8));
  
  // Create lighter and darker variants of secondary color for more versatility
  const secondaryLight = secondary.map(c => Math.min(255, Math.round(c * 1.15)));
  const secondaryDark = secondary.map(c => Math.round(c * 0.85));
  
  // Create accent variations
  const accentLight = accent.map(c => Math.min(255, Math.round(c * 1.1)));
  const accentDark = accent.map(c => Math.round(c * 0.9));
  
  // Create a semi-transparent version of the primary color for overlays
  const primaryTransparent = rgbToRgba(primary, 0.15);
  
  // Create a darker background for cards and panels
  const backgroundDark = background.map(c => Math.max(0, Math.round(c * 0.97)));
  
  return {
    '--primary-color': rgbToHex(primary),
    '--primary-color-light': rgbToHex(primaryLight),
    '--primary-color-dark': rgbToHex(primaryDark),
    '--primary-transparent': primaryTransparent,
    
    '--secondary-color': rgbToHex(secondary),
    '--secondary-color-light': rgbToHex(secondaryLight),
    '--secondary-color-dark': rgbToHex(secondaryDark),
    
    '--accent-color': rgbToHex(accent),
    '--accent-color-light': rgbToHex(accentLight),
    '--accent-color-dark': rgbToHex(accentDark),
    
    '--background-light': rgbToHex(background),
    '--background-dark': rgbToHex(backgroundDark),
    '--background-white': '#ffffff',
    
    '--text-primary': rgbToHex(text),
    '--text-secondary': onBackground === '#ffffff' ? '#dddddd' : '#666666',
    '--text-light': rgbToRgba(text, 0.7),
    
    '--text-on-primary': onPrimary,
    '--text-on-secondary': onSecondary,
    '--text-on-accent': onAccent,
    
    '--shadow-color': rgbToRgba(text, 0.1),
    '--card-border-color': rgbToRgba(primary, 0.3)
  };
};

/**
 * Generate complementary colors for decorative elements
 * @param {Array} rgb - Base RGB color
 * @returns {string} Hex color string
 */
export const getComplementaryColor = (rgb) => {
  // Create a complementary color by inverting the RGB values
  return rgbToHex([
    255 - rgb[0],
    255 - rgb[1],
    255 - rgb[2]
  ]);
};