import { defineConfig } from 'tinacms'

// --- Funções Helper ---
const PREDEFINED_CATEGORIES = {
  en: ['Exhibition', 'Graphic & Editorial Design', 'TV & Cinema Advertising'],
  de: ['Ausstellung', 'Grafik- & Editorialdesign', 'TV- & Kinowerbung'],
}
const getCategoryOptions = (language: 'en' | 'de') => {
  return PREDEFINED_CATEGORIES[language].map((category) => ({
    label: category,
    value: category,
  }))
}
const ORIENTATION_OPTIONS = [
  { label: 'Landscape (Wide)', value: 'landscape' },
  { label: 'Portrait (Tall)', value: 'portrait' },
  { label: 'Square', value: 'square' },
]
// --- Fim Funções Helper ---

// Lógica para determinar a Branch
const branch =
  process.env.BRANCH || // Variável padrão do Netlify para a branch do deploy
  process.env.HEAD || // Fallback Netlify
  'main' // Fallback final

export default defineConfig({
  // Configurações lidas do process.env
  branch: branch,
  // Garanta que TINA_CLIENT_ID esteja definido no Netlify
  clientId: process.env.TINA_CLIENT_ID || '',
  // Garanta que TINA_TOKEN esteja definido no Netlify
  token: process.env.TINA_TOKEN || '',

  // Configurações de Build e Media
  build: {
    outputFolder: 'admin',
    publicFolder: 'public',
  },
  media: {
    tina: {
      mediaRoot: 'images', // Pasta raiz para uploads via Tina Admin
      publicFolder: 'public',
    },
  },

  // Schema com suas coleções
  schema: {
    collections: [
      // --- Coleção 'project' ---
      {
        name: 'project',
        label: 'Projetos',
        path: 'content/projects',
        format: 'mdx',
        ui: {
          filename: {
            slugify: (values) => {
              // Gera slug a partir do campo slug, ou usa 'new-project'
              return `${values?.slug || 'new-project'}`
                .toLowerCase()
                .replace(/\s+/g, '-')
            },
          },
        },
        fields: [
          // Campos básicos...
          {
            type: 'number',
            name: 'order',
            label: 'Display Order',
            description: 'Order in the grid (lower first)',
          },
          {
            type: 'string',
            name: 'title_en',
            label: 'Title (English)',
            isTitle: true,
            required: true,
          },
          {
            type: 'string',
            name: 'title_de',
            label: 'Titel (Deutsch)',
            required: true,
          },
          {
            type: 'string',
            name: 'title_bra',
            label: 'Título (Português Brasil)',
            description: 'Optional BR title',
          },
          {
            type: 'string',
            name: 'slug',
            label: 'Slug (URL)',
            required: true,
            description: 'Lowercase, numbers, hyphens only',
          },
          {
            type: 'string',
            name: 'category_en',
            label: 'Category (English)',
            options: getCategoryOptions('en'),
            required: true,
          },
          {
            type: 'string',
            name: 'category_de',
            label: 'Kategorie (Deutsch)',
            ui: { component: 'select' },
            options: getCategoryOptions('de'),
            required: true,
          },
          { type: 'string', name: 'client', label: 'Client / Kunde' },
          { type: 'string', name: 'agency', label: 'Agency / Agentur' },
          { type: 'string', name: 'year', label: 'Year / Jahr' },
          {
            type: 'string',
            name: 'creativeDirection',
            label: 'Creative Direction',
          },
          { type: 'string', name: 'copyright', label: 'Copyright' },
          {
            type: 'rich-text',
            name: 'description_en',
            label: 'Description (English)',
          },
          {
            type: 'rich-text',
            name: 'description_de',
            label: 'Beschreibung (Deutsch)',
          },

          // Campo 'coverImageConfig' com fields internos preenchidos
          {
            type: 'object',
            name: 'coverImageConfig',
            label: 'Cover Image / Hero Image',
            fields: [
              {
                type: 'image',
                name: 'image',
                label: 'Cover Image',
                description:
                  'Used as cover/hero. Run optimization script after upload.',
                required: true,
              },
              {
                type: 'string',
                name: 'orientation',
                label: 'Image Orientation',
                ui: { component: 'select', defaultValue: 'landscape' },
                options: ORIENTATION_OPTIONS,
              },
              {
                type: 'boolean',
                name: 'includeInGallery',
                label: 'Include in Gallery Sequence',
                ui: { defaultValue: false },
              },
              {
                type: 'number',
                name: 'galleryPosition',
                label: 'Position in Gallery (if included)',
              },
            ],
          },
          // Campo 'coverImage' Legacy
          {
            type: 'image',
            name: 'coverImage',
            label: 'Cover Image (Legacy)',
            ui: { component: 'hidden' },
          },
          // Campo 'gallery' com fields internos preenchidos
          {
            type: 'object',
            name: 'gallery',
            label: 'Gallery Images',
            list: true,
            ui: {
              itemProps: (item) => ({
                label: `Image ${item?.position || 'New'} - ${
                  item?.orientation || 'Unspecified'
                }`,
              }),
              defaultItem: {
                caption_en: '',
                caption_de: '',
                featured: false,
                orientation: 'landscape',
                position: 1,
              },
            },
            fields: [
              {
                type: 'image',
                name: 'image',
                label: 'Image',
                required: true,
                description:
                  'Gallery image. Run optimization script after upload.',
              },
              {
                type: 'string',
                name: 'orientation',
                label: 'Image Orientation',
                ui: { component: 'select', defaultValue: 'landscape' },
                options: ORIENTATION_OPTIONS,
              },
              {
                type: 'number',
                name: 'position',
                label: 'Display Position',
                description: 'Sequence order (1 = first)',
              },
              {
                type: 'string',
                name: 'caption_en',
                label: 'Caption (English)',
              },
              {
                type: 'string',
                name: 'caption_de',
                label: 'Bildunterschrift (Deutsch)',
              },
              {
                type: 'boolean',
                name: 'featured',
                label: 'Featured (larger display)',
                ui: { defaultValue: false },
              },
              {
                type: 'boolean',
                name: 'mobileOnly',
                label: 'Mobile Only',
                ui: { defaultValue: false },
              },
              {
                type: 'boolean',
                name: 'desktopOnly',
                label: 'Desktop Only',
                ui: { defaultValue: false },
              },
            ],
          },
        ], // Fim dos fields de 'project'
      }, // Fim da coleção 'project'

      // --- Coleção 'page' ---
      {
        label: 'Pages',
        name: 'page',
        path: 'content/pages',
        format: 'mdx',
        ui: { allowedActions: { create: false, delete: false } }, // Impede criar/deletar páginas pela UI
        fields: [
          {
            type: 'string',
            label: 'Title (English)',
            name: 'title_en',
            isTitle: true,
            required: true,
          },
          {
            type: 'string',
            label: 'Title (German)',
            name: 'title_de',
            required: true,
          },
          {
            type: 'rich-text',
            label: 'Copy (English)',
            name: 'copy_en',
            isBody: false,
          },
          {
            type: 'rich-text',
            label: 'Copy (German)',
            name: 'copy_de',
            isBody: false,
          },
          { type: 'image', label: 'Page Image', name: 'profileImage' }, // Renomeado label para Page Image
        ],
      }, // Fim da coleção 'page'
    ], // Fim do array 'collections'
  }, // Fim do objeto 'schema'
})
