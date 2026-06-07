const Speciality = require('../models/Speciality');
const { slugify } = require('../utils/blogHelpers');

function serializeAdmin(doc) {
  return {
    id: doc._id.toString(),
    title: doc.title,
    slug: doc.slug,
    heroSubtitle: doc.heroSubtitle || '',
    heroImageUrl: doc.heroImageUrl || '',
    description: doc.description || '',
    heading1: doc.heading1 || '',
    image1Url: doc.image1Url || '',
    description1: doc.description1 || '',
    bullets: (doc.bullets || []).filter(isFilledBullet).map((b) => ({
      title: b.title || '',
      text: b.text || '',
    })),
    heading2: doc.heading2 || '',
    accordionCards: (doc.accordionCards || []).filter(isFilledAccordionCard).map((c) => ({
      label: c.label || '',
      description: c.description || '',
      imageUrl: c.imageUrl || '',
      accent: c.accent || '#7B2D3E',
    })),
    status: doc.status,
    order: doc.order ?? 0,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

function serializePublicList(doc) {
  return {
    id: doc._id.toString(),
    title: doc.title,
    slug: doc.slug,
    heroImageUrl: doc.heroImageUrl || '',
    description: doc.description || '',
    order: doc.order ?? 0,
  };
}

function isFilledBullet(b) {
  return Boolean(String(b?.title || '').trim() || String(b?.text || '').trim());
}

function isFilledAccordionCard(c) {
  return Boolean(
    String(c?.label || '').trim()
    || String(c?.description || '').trim()
    || String(c?.imageUrl || '').trim()
  );
}

function serializePublicDetail(doc) {
  const bullets = (doc.bullets || []).filter(isFilledBullet).map((b) => ({
    title: b.title || '',
    text: b.text || '',
  }));

  const accordionCards = (doc.accordionCards || [])
    .filter(isFilledAccordionCard)
    .map((c, index) => ({
      id: index,
      label: c.label || '',
      desc: c.description || '',
      imgSrc: c.imageUrl || '',
      imgAlt: c.label || '',
      accent: c.accent || '#7B2D3E',
    }));

  return {
    ...serializePublicList(doc),
    heroSubtitle: doc.heroSubtitle || '',
    heading1: doc.heading1 || '',
    image1Url: doc.image1Url || '',
    description1: doc.description1 || '',
    bullets,
    heading2: doc.heading2 || '',
    accordionCards,
  };
}

async function ensureUniqueSlug(baseSlug, excludeId = null) {
  let slug = baseSlug || 'specialite';
  let suffix = 0;

  while (true) {
    const candidate = suffix === 0 ? slug : `${slug}-${suffix}`;
    const query = { slug: candidate };
    if (excludeId) query._id = { $ne: excludeId };
    const exists = await Speciality.exists(query);
    if (!exists) return candidate;
    suffix += 1;
  }
}

function normalizePayload(body) {
  const bullets = Array.isArray(body.bullets)
    ? body.bullets
      .map((b) => ({
        title: String(b.title || '').trim(),
        text: String(b.text || '').trim(),
      }))
      .filter(isFilledBullet)
    : [];

  const accordionCards = Array.isArray(body.accordionCards)
    ? body.accordionCards
      .map((c, i) => ({
        label: String(c.label || '').trim(),
        description: String(c.description || c.desc || '').trim(),
        imageUrl: String(c.imageUrl || c.imgSrc || '').trim(),
        accent: String(c.accent || ['#7B2D3E', '#8B3A4E', '#9B4A5E'][i % 3]).trim(),
      }))
      .filter(isFilledAccordionCard)
    : [];

  return {
    title: String(body.title || '').trim(),
    heroSubtitle: String(body.heroSubtitle || '').trim(),
    heroImageUrl: String(body.heroImageUrl || '').trim(),
    description: String(body.description || '').trim(),
    heading1: String(body.heading1 || '').trim(),
    image1Url: String(body.image1Url || '').trim(),
    description1: String(body.description1 || '').trim(),
    bullets,
    heading2: String(body.heading2 || '').trim(),
    accordionCards,
    status: body.status === 'published' ? 'published' : 'draft',
    order: Number.isFinite(Number(body.order)) ? Number(body.order) : 0,
  };
}

exports.getSpecialitiesOverview = async (req, res) => {
  const items = await Speciality.find().sort({ order: 1, createdAt: -1 }).lean();
  res.json({
    success: true,
    specialities: items.map(serializeAdmin),
    total: items.length,
  });
};

exports.getSpecialityById = async (req, res) => {
  const doc = await Speciality.findById(req.params.id);
  if (!doc) {
    return res.status(404).json({ success: false, message: 'Speciality not found' });
  }
  res.json({ success: true, speciality: serializeAdmin(doc) });
};

exports.createSpeciality = async (req, res) => {
  const payload = normalizePayload(req.body);
  if (!payload.title) {
    return res.status(400).json({ success: false, message: 'Title is required' });
  }

  const baseSlug = slugify(req.body.slug || payload.title);
  const slug = await ensureUniqueSlug(baseSlug);
  const doc = await Speciality.create({
    ...payload,
    slug,
    publishedAt: payload.status === 'published' ? new Date() : null,
  });

  res.status(201).json({ success: true, speciality: serializeAdmin(doc) });
};

exports.updateSpeciality = async (req, res) => {
  const doc = await Speciality.findById(req.params.id);
  if (!doc) {
    return res.status(404).json({ success: false, message: 'Speciality not found' });
  }

  const payload = normalizePayload(req.body);
  if (!payload.title) {
    return res.status(400).json({ success: false, message: 'Title is required' });
  }

  if (req.body.slug) {
    const baseSlug = slugify(req.body.slug);
    doc.slug = await ensureUniqueSlug(baseSlug, doc._id);
  }

  Object.assign(doc, payload);
  if (payload.status === 'published' && !doc.publishedAt) {
    doc.publishedAt = new Date();
  }
  if (payload.status === 'draft') {
    doc.publishedAt = null;
  }

  await doc.save();
  res.json({ success: true, speciality: serializeAdmin(doc) });
};

exports.deleteSpeciality = async (req, res) => {
  const doc = await Speciality.findByIdAndDelete(req.params.id);
  if (!doc) {
    return res.status(404).json({ success: false, message: 'Speciality not found' });
  }
  res.json({ success: true, message: 'Speciality deleted' });
};

exports.uploadSpecialityImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No image uploaded' });
  }
  res.json({
    success: true,
    url: `/uploads/specialities/${req.file.filename}`,
  });
};

exports.getPublicSpecialities = async (_req, res) => {
  const items = await Speciality.find({ status: 'published' })
    .sort({ order: 1, title: 1 })
    .lean();

  res.json({
    success: true,
    specialities: items.map(serializePublicList),
  });
};

exports.getPublicSpecialityBySlug = async (req, res) => {
  const slug = String(req.params.slug || '').toLowerCase().trim();
  const doc = await Speciality.findOne({ slug, status: 'published' });
  if (!doc) {
    return res.status(404).json({ success: false, message: 'Speciality not found' });
  }

  res.json({ success: true, speciality: serializePublicDetail(doc) });
};
