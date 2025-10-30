import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface VideoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function VideoDialog({ open, onOpenChange }: VideoDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-2xl font-semibold">VyaparFlow in 2 Minutes</DialogTitle>
        </DialogHeader>
        <div className="p-6 pt-4">
          {/* In a real implementation, this would be a YouTube or Vimeo embed */}
          <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
            <div className="absolute inset-0 bg-accent/10 rounded-lg flex flex-col items-center justify-center text-center p-4">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="24" 
                    height="24" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="text-primary-foreground"
                  >
                    <polygon points="6 3 20 12 6 21 6 3"></polygon>
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-medium mb-1">Demo Video</h3>
              <p className="text-muted-foreground text-sm">
                This would be a real video in production. The video would showcase VyaparFlow's features and benefits.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}