/** Atlas Dental Center — email palette (maroon, white, gray). */
const BRAND = {
  maroon: '#591727',
  maroonDark: '#711C31',
  maroonDeep: '#681A2D',
  maroonLight: '#8B1A2E',
  muted: '#7A3048',
  white: '#ffffff',
  grayPage: '#F3F4F6',
  grayCard: '#F9FAFB',
  grayBorder: '#E5E7EB',
  grayFooter: '#F3F4F6',
  badgeBg: '#F3F4F6',
};

const FONT =
  "Georgia,'Times New Roman',Times,serif";

function contentCard(extra = '') {
  return `margin:16px 0;background:${BRAND.grayCard};border-radius:10px;border:1px solid ${BRAND.grayBorder};${extra}`;
}

module.exports = {
  BRAND,
  FONT,
  contentCard,
};
