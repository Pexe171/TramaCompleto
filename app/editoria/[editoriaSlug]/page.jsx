import { redirect } from 'next/navigation';

export default function EditoriaRedirectPage({ params }) {
  const { editoriaSlug } = params;
  redirect(`/editorias/${editoriaSlug}`);
}
