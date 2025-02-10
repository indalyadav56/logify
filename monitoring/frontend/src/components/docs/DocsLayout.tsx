import { Link, Outlet, useLocation } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Search,
  Book,
  Code2,
  Boxes,
  Wrench,
  Shield,
  Webhook,
  Settings,
  HelpCircle,
} from 'lucide-react';

const DocsLayout = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const sidebarItems = [
    {
      title: 'Getting Started',
      icon: Book,
      items: [
        { name: 'Introduction', path: '/docs' },
        { name: 'Quick Start', path: '/docs/quickstart' },
        { name: 'Installation', path: '/docs/installation' },
        { name: 'Configuration', path: '/docs/configuration' },
      ]
    },
    {
      title: 'SDKs',
      icon: Code2,
      items: [
        { name: 'Python SDK', path: '/docs/python' },
        { name: 'JavaScript SDK', path: '/docs/javascript' },
        { name: 'Go SDK', path: '/docs/go' },
        { name: 'Java SDK', path: '/docs/java' },
      ]
    },
    {
      title: 'Core Concepts',
      icon: Boxes,
      items: [
        { name: 'Log Management', path: '/docs/log-management' },
        { name: 'Metrics', path: '/docs/metrics' },
        { name: 'Alerts', path: '/docs/alerts' },
        { name: 'Dashboards', path: '/docs/dashboards' },
      ]
    },
    {
      title: 'Advanced Features',
      icon: Wrench,
      items: [
        { name: 'AI Analytics', path: '/docs/ai-analytics' },
        { name: 'Custom Metrics', path: '/docs/custom-metrics' },
        { name: 'Log Parsing', path: '/docs/log-parsing' },
        { name: 'Retention Policies', path: '/docs/retention' },
      ]
    },
    {
      title: 'Security',
      icon: Shield,
      items: [
        { name: 'Authentication', path: '/docs/authentication' },
        { name: 'Access Control', path: '/docs/access-control' },
        { name: 'API Keys', path: '/docs/api-keys' },
        { name: 'Compliance', path: '/docs/compliance' },
      ]
    },
    {
      title: 'Integrations',
      icon: Webhook,
      items: [
        { name: 'AWS', path: '/docs/aws' },
        { name: 'Google Cloud', path: '/docs/gcp' },
        { name: 'Kubernetes', path: '/docs/kubernetes' },
        { name: 'Docker', path: '/docs/docker' },
      ]
    },
    {
      title: 'API Reference',
      icon: Settings,
      items: [
        { name: 'REST API', path: '/docs/api' },
        { name: 'GraphQL API', path: '/docs/graphql' },
        { name: 'Webhooks', path: '/docs/webhooks' },
        { name: 'Rate Limits', path: '/docs/rate-limits' },
      ]
    },
    {
      title: 'Support',
      icon: HelpCircle,
      items: [
        { name: 'FAQ', path: '/docs/faq' },
        { name: 'Troubleshooting', path: '/docs/troubleshooting' },
        { name: 'Best Practices', path: '/docs/best-practices' },
        { name: 'Community', path: '/docs/community' },
      ]
    },
  ];

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-64 border-r bg-muted/30 hidden md:block">
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search docs..." className="pl-8" />
          </div>
        </div>
        <div className="p-4 space-y-8">
          {sidebarItems.map((section) => (
            <div key={section.title}>
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                <section.icon className="h-4 w-4" />
                {section.title}
              </div>
              <div className="space-y-1">
                {section.items.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "block px-2 py-1 text-sm rounded-md",
                      isActive(item.path)
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="container max-w-4xl py-6 px-4">
          <Outlet />
        </div>
      </div>

      {/* Table of Contents */}
      <div className="w-64 border-l bg-muted/30 hidden lg:block p-4">
        <div className="sticky top-4">
          <div className="text-sm font-medium mb-4">On this page</div>
          <div className="space-y-2 text-sm">
            <a href="#overview" className="block text-muted-foreground hover:text-foreground">Overview</a>
            <a href="#prerequisites" className="block text-muted-foreground hover:text-foreground">Prerequisites</a>
            <a href="#installation" className="block text-muted-foreground hover:text-foreground">Installation</a>
            <a href="#configuration" className="block text-muted-foreground hover:text-foreground">Configuration</a>
            <a href="#usage" className="block text-muted-foreground hover:text-foreground">Usage</a>
            <a href="#examples" className="block text-muted-foreground hover:text-foreground">Examples</a>
            <a href="#api-reference" className="block text-muted-foreground hover:text-foreground">API Reference</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocsLayout;
