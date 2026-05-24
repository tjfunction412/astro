import { redirect } from 'next/navigation';

// Root → Today is the default landing surface per ia.md
export default function Home() {
  redirect('/today');
}
