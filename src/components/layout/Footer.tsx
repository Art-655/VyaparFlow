import { Link } from 'react-router-dom';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-background border-t border-border py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="mb-4 md:mb-0">
          <div className="flex items-center space-x-2 mb-2">
            <img 
              src="https://storage.googleapis.com/fenado-ai-farm-public/generated/f822c49b-0faf-4632-b39c-b7c53da01628.webp" 
              alt="VyaparFlow Logo" 
              className="h-8 w-8"
            />
            <span className="text-lg font-semibold text-foreground">VyaparFlow</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {currentYear} VyaparFlow. All rights reserved.
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-8">
          <Link to="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            Privacy Policy
          </Link>
          <Link to="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            Terms of Service
          </Link>
          <span className="text-sm text-muted-foreground">
            Contact: <a href="mailto:hello@vyaparflow.com" className="hover:text-primary transition-colors">hello@vyaparflow.com</a>
          </span>
        </div>
      </div>
    </footer>
  );
}