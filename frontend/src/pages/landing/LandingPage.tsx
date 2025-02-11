import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, ArrowRight, BarChart2, Lock, Brain, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Pricing from "./Pricing";
import SDKSection from "./SDKSection";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6" />
            <span className="font-bold text-xl">Logify</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a
              href="/features"
              className="text-muted-foreground hover:text-foreground"
            >
              Features
            </a>
            <a
              href="/sdks"
              className="text-muted-foreground hover:text-foreground"
            >
              SDKs
            </a>
            <a
              href="/pricing"
              className="text-muted-foreground hover:text-foreground"
            >
              Pricing
            </a>
            <a
              href="/docs"
              className="text-muted-foreground hover:text-foreground"
            >
              Documentation
            </a>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link to="/signup">
              <Button>Get Started</Button>
            </Link>
          </div>

          {/* Mobile Navigation */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <div className="flex flex-col gap-4 mt-8">
                <a
                  href="#features"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Features
                </a>
                <a
                  href="#sdks"
                  className="text-muted-foreground hover:text-foreground"
                >
                  SDKs
                </a>
                <a
                  href="#pricing"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Pricing
                </a>
                <a
                  href="#docs"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Documentation
                </a>
                <hr className="my-4" />
                <Link to="/login">
                  <Button variant="ghost" className="w-full">
                    Login
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button className="w-full">Get Started</Button>
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-muted px-3 py-1 rounded-full text-sm mb-8">
              <span className="bg-primary h-2 w-2 rounded-full" />
              New: AI-Powered Log Analytics
            </div>
            <h1 className="text-5xl font-bold mb-6">
              Advanced Log Management for Modern Teams
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Powerful log analytics with AI-driven insights, real-time
              monitoring, and advanced security features. Built for enterprises,
              loved by developers.
            </p>
            <div className="flex gap-4 justify-center">
              <Link to="/signup">
                <Button size="lg" className="gap-2">
                  Start Free Trial
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Button size="lg" variant="outline">
                Schedule Demo
              </Button>
            </div>
            <div className="mt-8 text-sm text-muted-foreground">
              No credit card required · 14-day free trial · Cancel anytime
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-muted/50" id="features">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Everything you need for log management
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-background rounded-lg border">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <BarChart2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Real-time Analytics
              </h3>
              <p className="text-muted-foreground">
                Monitor your systems in real-time with powerful analytics and
                customizable dashboards.
              </p>
            </div>
            <div className="p-6 bg-background rounded-lg border">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Lock className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Enterprise Security
              </h3>
              <p className="text-muted-foreground">
                Advanced security features with role-based access control and
                compliance monitoring.
              </p>
            </div>
            <div className="p-6 bg-background rounded-lg border">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                AI-Powered Insights
              </h3>
              <p className="text-muted-foreground">
                Leverage AI to detect anomalies, predict issues, and get
                actionable insights.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SDK Section */}
      <SDKSection />

      {/* Pricing Section */}
      <Pricing />

      {/* Stats Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">99.9%</div>
              <div className="text-muted-foreground">Uptime</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50M+</div>
              <div className="text-muted-foreground">Logs Processed</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">5000+</div>
              <div className="text-muted-foreground">Happy Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-muted-foreground">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Integration Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-12">Works with your stack</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="p-6 bg-background rounded-lg border flex items-center justify-center">
              AWS
            </div>
            <div className="p-6 bg-background rounded-lg border flex items-center justify-center">
              Google Cloud
            </div>
            <div className="p-6 bg-background rounded-lg border flex items-center justify-center">
              Azure
            </div>
            <div className="p-6 bg-background rounded-lg border flex items-center justify-center">
              Kubernetes
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to get started?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of teams who trust Logify for their log management
              needs.
            </p>
            <div className="flex gap-4 justify-center">
              <Link to="/signup">
                <Button size="lg">Get Started</Button>
              </Link>
              <Button size="lg" variant="outline">
                Contact Sales
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Shield className="h-6 w-6" />
                <span className="font-bold text-xl">Logify</span>
              </div>
              <p className="text-muted-foreground">
                Advanced log management for modern teams.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>Features</li>
                <li>Pricing</li>
                <li>Security</li>
                <li>Enterprise</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>About</li>
                <li>Blog</li>
                <li>Careers</li>
                <li>Contact</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>Privacy</li>
                <li>Terms</li>
                <li>Security</li>
                <li>GDPR</li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t text-center text-muted-foreground">
            &copy; 2024 Logify. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
