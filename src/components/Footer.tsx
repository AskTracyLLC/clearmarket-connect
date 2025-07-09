import { Link } from "react-router-dom";
const Footer = () => {
  return <footer className="bg-secondary border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">C</span>
              </div>
              <span className="text-xl font-bold text-foreground">ClearMarket</span>
            </div>
            <p className="text-muted-foreground text-sm">Connecting property inspection professionals through transparency and trust — paving the way for a better way to do business in inspections.</p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">For Field Reps</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/fieldrep/search" className="text-muted-foreground hover:text-foreground transition-colors">Find Work</Link></li>
              <li><Link to="/fieldrep/profile" className="text-muted-foreground hover:text-foreground transition-colors">Build Profile</Link></li>
              <li><Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors">Success Stories</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">For Vendors</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="#" className="text-muted-foreground hover:text-foreground transition-colors">Find Coverage</Link></li>
              <li><Link to="#" className="text-muted-foreground hover:text-foreground transition-colors">Search Professionals</Link></li>
              <li><Link to="#" className="text-muted-foreground hover:text-foreground transition-colors">Credits System</Link></li>
              <li><Link to="#" className="text-muted-foreground hover:text-foreground transition-colors">Platform Guide</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors">Contact</Link></li>
              <li><Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-muted-foreground hover:text-foreground transition-colors">Terms of Service</Link></li>
              <li><Link to="/refund-policy" className="text-muted-foreground hover:text-foreground transition-colors">Refund Policy</Link></li>
              <li><Link to="/faq" className="text-muted-foreground hover:text-foreground transition-colors">FAQ</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-muted-foreground text-sm">
            © 2024 ClearMarket. All rights reserved. | Paving the Way to a Better Way to Work Together
          </p>
        </div>
      </div>
    </footer>;
};
export default Footer;