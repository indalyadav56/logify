import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from 'lucide-react';

const PricingCard = ({
  name,
  price,
  description,
  features,
  popular,
  buttonText = "Get Started",
}: {
  name: string;
  price: string;
  description: string;
  features: string[];
  popular?: boolean;
  buttonText?: string;
}) => (
  <Card className={`p-6 ${popular ? 'border-primary shadow-lg' : ''}`}>
    {popular && (
      <Badge className="mb-4 bg-primary">Most Popular</Badge>
    )}
    <h3 className="text-2xl font-bold">{name}</h3>
    <div className="mt-4 mb-2">
      <span className="text-4xl font-bold">${price}</span>
      {price !== 'Custom' && <span className="text-muted-foreground">/month</span>}
    </div>
    <p className="text-muted-foreground mb-6">{description}</p>
    <Link to="/signup">
      <Button className="w-full mb-6" variant={popular ? "default" : "outline"}>
        {buttonText}
      </Button>
    </Link>
    <ul className="space-y-3">
      {features.map((feature, index) => (
        <li key={index} className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
          <span className="text-sm">{feature}</span>
        </li>
      ))}
    </ul>
  </Card>
);

const Pricing = () => {
  const plans = [
    {
      name: "Starter",
      price: "49",
      description: "Perfect for small teams and startups",
      features: [
        "Up to 100,000 logs/day",
        "7-day log retention",
        "5 team members",
        "Basic log analytics",
        "Email support",
        "Basic integrations",
        "Community access"
      ]
    },
    {
      name: "Professional",
      price: "199",
      description: "For growing teams with advanced needs",
      popular: true,
      features: [
        "Up to 1M logs/day",
        "30-day log retention",
        "Unlimited team members",
        "Advanced analytics",
        "AI-powered insights",
        "Priority support",
        "Advanced integrations",
        "Custom dashboards",
        "API access",
        "SSO authentication"
      ]
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "Custom solutions for large organizations",
      buttonText: "Contact Sales",
      features: [
        "Unlimited logs",
        "Custom retention period",
        "Dedicated support",
        "Custom integrations",
        "On-premise deployment",
        "SLA guarantee",
        "Compliance support",
        "Advanced security",
        "Custom training",
        "Dedicated account manager"
      ]
    }
  ];

  return (
    <section className="py-20 bg-muted/50" id="pricing">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold mb-4">Simple, transparent pricing</h2>
          <p className="text-xl text-muted-foreground">
            Choose the perfect plan for your team. All plans include a 14-day free trial.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <PricingCard key={plan.name} {...plan} />
          ))}
        </div>
        <div className="mt-16 text-center">
          <h3 className="text-xl font-semibold mb-6">Enterprise Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="p-4 bg-background rounded-lg border">
              <h4 className="font-semibold mb-2">Custom Deployment</h4>
              <p className="text-sm text-muted-foreground">On-premise or private cloud deployment options</p>
            </div>
            <div className="p-4 bg-background rounded-lg border">
              <h4 className="font-semibold mb-2">Advanced Security</h4>
              <p className="text-sm text-muted-foreground">Custom security policies and compliance</p>
            </div>
            <div className="p-4 bg-background rounded-lg border">
              <h4 className="font-semibold mb-2">24/7 Support</h4>
              <p className="text-sm text-muted-foreground">Dedicated support team and account manager</p>
            </div>
            <div className="p-4 bg-background rounded-lg border">
              <h4 className="font-semibold mb-2">Custom Integration</h4>
              <p className="text-sm text-muted-foreground">Custom integrations and API access</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
