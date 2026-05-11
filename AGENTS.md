# Roles
- **Sanity Architect**: Responsible for extending schemas without breaking existing document IDs.
- **Frontend Engineer**: Responsible for React 19, Next.js 16, and Tailwind CSS v4 implementations.
- **UX Optimizer**: Responsible for motion mechanics and checkout friction reduction.

# Critical Rules
- **Framework Mandate**: Strict adherence to Next.js 16 App Router and Partial Prerendering (PPR) using <Suspense> boundaries.
- **Styling Mandate**: Use Tailwind CSS v4 exclusively. Rely on @theme configurations and @source for safelisting dynamically generated Sanity classes.
- **Data Integrity**: Never execute destructive modifications on existing Sanity _ids or database structures. Append new schemas only.
- **Layout Constraints**: Bento grids must strictly use CSS Grid (grid-auto-flow: dense), completely avoiding Flexbox or heavy JavaScript libraries like Masonry.js.
