/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineConfig } from 'tinacms'

const PREDEFINED_CATEGORIES = {
  en: ['Exhibition', 'Graphic & Editorial Design', 'TV & Cinema Advertising'],
  de: ['Ausstellung', 'Grafik- & Editorialdesign', 'TV- & Kinowerbung'],
}

// Create a helper to generate options for select fields
const getCategoryOptions = (language: 'en' | 'de') => {
  return PREDEFINED_CATEGORIES[language].map((category) => ({
    label: category,
    value: category,
  }))
}

// Image orientation options
const ORIENTATION_OPTIONS = [
  { label: 'Landscape (Wide)', value: 'landscape' },
  { label: 'Portrait (Tall)', value: 'portrait' },
  { label: 'Square', value: 'square' },
]

export default defineConfig({
  branch: '',
  clientId: '', // Deixe vazio para testes locais
  token: '', // Deixe vazio para testes locais
  build: {
    outputFolder: 'admin',
    publicFolder: 'public',
  },
  media: {
    tina: {
      mediaRoot: 'images/projects',
      publicFolder: 'public',
    },
  },
  // The plugins property is removed since it's not supported
  schema: {
    collections: [
      {
        name: 'project',
        label: 'Projetos',
        path: 'content/projects',
        format: 'mdx',
        ui: {
          filename: {
            slugify: (values) => {
              return `${values?.slug || 'new-project'}`
            },
          },
        },
        fields: [
          // Basic fields
          {
            type: 'number',
            name: 'order',
            label: 'Display Order (lower numbers appear first)',
            description:
              'Set the display order of this project in the grid (e.g., 1 for first)',
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
            description:
              'Optional Brazilian Portuguese title that will appear below the main title',
          },
          {
            type: 'string',
            name: 'slug',
            label: 'Slug (URL)',
            required: true,
            description: 'Use only lowercase letters, numbers, and hyphens',
          },

          // Category fields with field-level hooks for linking
          {
            type: 'string',
            name: 'category_en',
            label: 'Category (English)',
            ui: {
              format: (value) => {
                setTimeout(() => {
                  // Use type assertion to bypass TypeScript error
                  const tinaCMS = (window as any).tinacms
                  if (typeof window !== 'undefined' && tinaCMS?.form) {
                    const index = PREDEFINED_CATEGORIES.en.findIndex(
                      (cat) => cat === value,
                    )
                    if (index >= 0) {
                      const currentDe = tinaCMS.form.values.category_de
                      if (currentDe !== PREDEFINED_CATEGORIES.de[index]) {
                        tinaCMS.form.change(
                          'category_de',
                          PREDEFINED_CATEGORIES.de[index],
                        )
                      }
                    }
                  }
                }, 0)
                return value
              },
            },
            options: getCategoryOptions('en'),
            required: true,
          },
          {
            type: 'string',
            name: 'category_de',
            label: 'Kategorie (Deutsch)',
            ui: {
              component: 'select',
              validate: (value, allValues, meta) => {
                // This runs whenever the field changes
                // Find corresponding English category
                const index = PREDEFINED_CATEGORIES.de.findIndex(
                  (cat) => cat === value,
                )
                if (
                  index >= 0 &&
                  allValues.category_en !== PREDEFINED_CATEGORIES.en[index]
                ) {
                  // Update the English field
                  setTimeout(() => {
                    ;(meta as any).form?.change(
                      'category_en',
                      PREDEFINED_CATEGORIES.en[index],
                    )
                  })
                }
                // Return undefined for no validation errors
                return undefined
              },
            },
            options: getCategoryOptions('de'),
            required: true,
          },

          // Client fields
          {
            type: 'string',
            name: 'client',
            label: 'Client / Kunde',
          },
          {
            type: 'string',
            name: 'agency',
            label: 'Agency / Agentur',
          },
          {
            type: 'string',
            name: 'year',
            label: 'Year / Jahr',
          },
          {
            type: 'string',
            name: 'creativeDirection',
            label: 'Creative Direction',
          },
          {
            type: 'string',
            name: 'copyright',
            label: 'Copyright',
          },

          // Description fields
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

          // Enhanced Cover Image
          {
            type: 'object',
            name: 'coverImageConfig',
            label: 'Cover Image / Hero Image',
            ui: {
              itemProps: () => ({
                label: 'Cover Image Configuration',
              }),
            },
            fields: [
              {
                type: 'image',
                name: 'image',
                label: 'Cover Image',
                description:
                  'This image will be used as cover in grid and hero in detail page. After uploading, run the optimization script.',
                required: true,
              },
              {
                type: 'string',
                name: 'orientation',
                label: 'Image Orientation',
                description: 'Select the natural orientation of this image',
                ui: {
                  component: 'select',
                  defaultValue: 'landscape',
                },
                options: ORIENTATION_OPTIONS,
              },
              {
                type: 'boolean',
                name: 'includeInGallery',
                label: 'Include in Gallery Sequence',
                description:
                  'If checked, this cover image will also appear in the gallery sequence',
                ui: {
                  defaultValue: false,
                },
              },
              {
                type: 'number',
                name: 'galleryPosition',
                label: 'Position in Gallery (if included)',
                description:
                  'Position number where this image should appear in the sequence (1 for first)',
              },
            ],
          },

          // Legacy cover image field for backward compatibility
          {
            type: 'image',
            name: 'coverImage',
            label: 'Cover Image (Legacy)',
            description:
              'Legacy field - please use the Cover Image Configuration section above instead.',
            ui: {
              component: 'hidden',
            },
          },

          // Enhanced Gallery
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
                description:
                  'Gallery image. After uploading all images, run the optimization script.',
                required: true,
              },
              {
                type: 'string',
                name: 'orientation',
                label: 'Image Orientation',
                description: 'Select the natural orientation of this image',
                ui: {
                  component: 'select',
                  defaultValue: 'landscape',
                },
                options: ORIENTATION_OPTIONS,
              },
              {
                type: 'number',
                name: 'position',
                label: 'Display Position',
                description:
                  'Position number in the sequence (1 for first). Will be automatically assigned but can be changed.',
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
                description:
                  'If checked, this image will span multiple columns on larger screens',
                ui: {
                  defaultValue: false,
                },
              },
              {
                type: 'boolean',
                name: 'mobileOnly',
                label: 'Mobile Only',
                description:
                  'If checked, this image will only be shown on mobile devices',
                ui: {
                  defaultValue: false,
                },
              },
              {
                type: 'boolean',
                name: 'desktopOnly',
                label: 'Desktop Only',
                description:
                  'If checked, this image will only be shown on desktop devices',
                ui: {
                  defaultValue: false,
                },
              },
            ],
          },
        ],
      },
    ],
  },
})
