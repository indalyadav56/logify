import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Book,
  Code2,
  Boxes,
  Wrench,
  Shield,
  Webhook,
} from 'lucide-react';

const Introduction = () => {
  const features = [
    {
      icon: Book,
      title: "Quick Start",
      description: "Get up and running with Logify in minutes",
      link: "/docs/quickstart"
    },
    {
      icon: Code2,
      title: "SDK Documentation",
      description: "Comprehensive guides for all our SDKs",
      link: "/docs/sdks"
    },
    {
      icon: Boxes,
      title: "Core Concepts",
      description: "Learn about logs, metrics, and alerts",
      link: "/docs/concepts"
    },
    {
      icon: Wrench,
      title: "Advanced Features",
      description: "AI analytics and custom metrics",
      link: "/docs/advanced"
    },
    {
      icon: Shield,
      title: "Security",
      description: "Authentication and access control",
      link: "/docs/security"
    },
    {
      icon: Webhook,
      title: "Integrations",
      description: "Connect with your favorite tools",
      link: "/docs/integrations"
    },
  ];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Welcome to Logify</h1>
        <p className="text-xl text-muted-foreground">
          The modern platform for log management and analytics
        </p>
      </div>

      <div className="mt-8 space-y-8">
        {/* Overview */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Overview</h2>
          <p className="text-muted-foreground leading-7">
            Logify is a powerful log management and analytics platform designed for modern teams.
            Our platform helps you collect, analyze, and act on your log data with advanced features
            like AI-powered insights, real-time monitoring, and seamless integrations.
          </p>
        </section>

        {/* Key Features */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Key Features</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Log Management</CardTitle>
                <CardDescription>
                  Collect and store logs from any source with powerful search and filtering
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Real-time Analytics</CardTitle>
                <CardDescription>
                  Monitor your systems with customizable dashboards and alerts
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>AI-Powered Insights</CardTitle>
                <CardDescription>
                  Automatically detect anomalies and get actionable recommendations
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Team Collaboration</CardTitle>
                <CardDescription>
                  Share dashboards and collaborate with your team effectively
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        {/* Getting Started */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {features.map((feature) => (
              <Link key={feature.title} to={feature.link}>
                <div className="group p-4 rounded-lg border bg-card hover:border-primary transition-colors">
                  <feature.icon className="h-6 w-6 mb-2 text-muted-foreground group-hover:text-primary" />
                  <h3 className="font-semibold mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Popular Guides */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Popular Guides</h2>
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Setting up your first dashboard</CardTitle>
                <CardDescription>
                  Learn how to create and customize dashboards for your team
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/docs/dashboards">
                  <Button variant="secondary">Read Guide</Button>
                </Link>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Configuring alerts</CardTitle>
                <CardDescription>
                  Set up intelligent alerts to monitor your systems
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/docs/alerts">
                  <Button variant="secondary">Read Guide</Button>
                </Link>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Advanced log querying</CardTitle>
                <CardDescription>
                  Master the art of searching and analyzing your logs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/docs/log-querying">
                  <Button variant="secondary">Read Guide</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Support */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Need Help?</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Community Support</CardTitle>
                <CardDescription>
                  Join our community forum to get help and share knowledge
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="secondary">Visit Forum</Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Enterprise Support</CardTitle>
                <CardDescription>
                  Get dedicated support from our team of experts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="secondary">Contact Support</Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Introduction;
