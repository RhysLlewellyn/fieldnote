import type {StructureResolver} from 'sanity/structure'

/**
 * The Studio's left-hand navigation.
 *
 * Written out by hand rather than left to the default list so that:
 *   - Site settings opens the one document directly, with no list in the way
 *     and no "create new" button
 *   - Articles, the thing editors touch every day, sits at the top
 */
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Fieldnote')
    .items([
      S.documentTypeListItem('article').title('Articles'),
      S.documentTypeListItem('issue').title('Issues'),
      S.divider(),
      S.documentTypeListItem('author').title('Authors'),
      S.documentTypeListItem('topic').title('Topics'),
      S.documentTypeListItem('page').title('Pages'),
      S.divider(),
      S.listItem()
        .title('Site settings')
        .id('siteSettings')
        .child(
          S.document()
            .schemaType('siteSettings')
            .documentId('siteSettings')
            .title('Site settings'),
        ),
    ])
