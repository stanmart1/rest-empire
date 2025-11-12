import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface FounderBioModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const FounderBioModal = ({ open, onOpenChange }: FounderBioModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl md:text-3xl font-bold">Ayodele Kikelomo</DialogTitle>
        </DialogHeader>
        <div className="space-y-5 text-muted-foreground">
          <p className="text-base md:text-lg leading-relaxed">
            At the heart of Opened Seal & Rest Empire is our visionary leader, Ayodele Kikelomo, a dynamic financial coach, crypto trader, and entrepreneur with a passion for empowering individuals to achieve financial freedom and holistic growth.
          </p>
          <p className="text-base md:text-lg leading-relaxed">
            With years of experience in the business and finance sector, she has dedicated her career to teaching practical wealth-creation strategies, helping people transition from financial uncertainty to sustainable prosperity. Her expertise as a financial coach has impacted countless lives, providing individuals and organizations with the tools to make sound financial decisions, build lasting wealth, and secure generational legacies.
          </p>
          <p className="text-base md:text-lg leading-relaxed">
            As a crypto trader, she embraces innovation and the future of finance, equipping communities with knowledge to navigate the digital economy and harness emerging opportunities. Her entrepreneurial drive is evident in her ability to build systems, scale businesses, and inspire leaders to pursue excellence in every endeavor.
          </p>
          <p className="text-base md:text-lg leading-relaxed">
            Beyond wealth, she champions a holistic approach to success — promoting health, capacity development, and legacy thinking as non-negotiable pillars for personal and societal transformation.
          </p>
          <p className="text-base md:text-lg leading-relaxed">
            With a divine mandate to raise leaders who will eradicate poverty, ignorance, and disease, she continues to spearhead Opened Seal & Rest Empire as more than just an organization, but a global movement of impact and transformation.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FounderBioModal;
