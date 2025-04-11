import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-blue-500 gap-8">
      <h1 className="text-3xl font-bold text-white underline">
        Welcome To TFSC Ration Application
      </h1>
      
      <Link 
        href="/auth/login" 
        className="px-6 py-3 bg-white text-blue-600 rounded-lg font-medium hover:bg-[#f9f9f9] transition-colors"
      >
        Login
      </Link>
    </div>
  );
}