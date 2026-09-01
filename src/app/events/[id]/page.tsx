import { redirect } from 'next/navigation'

export default async function EventDetailRedirect({ params }: PageProps<'/events/[id]'>) {
  const { id } = await params
  redirect(`/archive/${id}`)
}
