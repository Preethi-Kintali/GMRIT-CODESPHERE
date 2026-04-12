import { Link } from "react-router";
import { MoveLeft } from "lucide-react";

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-6 text-center">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]" />
      </div>

      <h1 className="text-9xl font-black text-white/5 mb-4 select-none">404</h1>
      
      <div className="relative">
        <h2 className="text-4xl font-bold text-white mb-4">Lost in the Sphere?</h2>
        <p className="text-neutral-400 max-w-md mb-8 mx-auto leading-relaxed">
          The page you're searching for has vanished into digital weightlessness or never existed in this dimension.
        </p>
        
        <Link 
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-semibold rounded-full hover:bg-neutral-200 transition-all active:scale-95"
        >
          <MoveLeft size={18} />
          Back to Reality
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
