// The person who writes and reviews Barista Flow content.
// Fill in `name` (a real name or a consistent pen name) and the bio fields to show an
// "About the editor" section on the About page and a reviewer line on every guide.
// While `name` is empty, nothing is shown.

export interface Editor {
  name: string;
  role: { zh: string; en: string };
  bio: { zh: string; en: string };
  /** Concrete, checkable experience: years brewing, equipment used daily, courses, competitions. */
  experience: { zh: string[]; en: string[] };
  /** Optional square photo placed in public/images, e.g. '/images/editor.jpg'. */
  photo?: string;
  links?: { label: string; url: string }[];
}

export const editor: Editor = {
  name: '',
  role: { zh: '', en: '' },
  bio: { zh: '', en: '' },
  experience: { zh: [], en: [] },
  photo: '',
  links: []
};

export const hasEditor = editor.name.trim().length > 0;
