import Link from "next/link";
import {
  BarChart3,
  Car,
  DollarSign,
  Gauge,
  Mail,
  Phone,
  Route,
  Shield,
  Users,
} from "lucide-react";

import { BRAND_EMAIL, BRAND_NAME } from "@fleetio/custom-config";
import { Badge } from "@fleetio/ui/badge";
import { Button } from "@fleetio/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@fleetio/ui/card";

const features = [
  {
    icon: Car,
    title: "Fleet Management",
    description:
      "Comprehensive vehicle tracking and maintenance scheduling for your entire fleet.",
    color: "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
  },
  {
    icon: Users,
    title: "Driver Management",
    description: "Manage driver profiles, licenses, and assignments with ease.",
    color: "bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400",
  },
  {
    icon: Route,
    title: "Trip Planning",
    description:
      "Optimize routes and track trips in real-time for maximum efficiency.",
    color:
      "bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400",
  },
  {
    icon: BarChart3,
    title: "Analytics & Reports",
    description:
      "Get insights into your fleet performance with detailed analytics.",
    color:
      "bg-orange-50 text-orange-600 dark:bg-orange-950 dark:text-orange-400",
  },
  {
    icon: Shield,
    title: "Security & Compliance",
    description:
      "Ensure compliance with industry standards and maintain security protocols.",
    color: "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400",
  },
  {
    icon: DollarSign,
    title: "Cost Effective Solutions",
    description:
      "Reduce operational costs with simple, streamlined processes and automated workflows.",
    color:
      "bg-yellow-50 text-yellow-600 dark:bg-yellow-950 dark:text-yellow-400",
  },
];

export default function Home() {
  return (
    <main className="bg-background min-h-screen">
      {/* Hero Section */}
      <section className="space-y-6 p-4 sm:space-y-8 sm:p-6">
        <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-6 text-center">
          <div className="mb-4 flex flex-col items-center gap-3 md:flex-row">
            <div className="bg-primary/10 rounded-xl p-3">
              <Gauge className="text-primary h-12 w-12" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              {BRAND_NAME}
            </h1>
          </div>

          <p className="text-muted-foreground max-w-2xl text-lg sm:text-xl">
            Effortlessly manage your fleet, drivers, and trips with our
            comprehensive fleet management solution.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link href="/auth/sign-in">
              <Button size="lg" className="w-full cursor-pointer sm:w-auto">
                Get Started
              </Button>
            </Link>
            <Link href="/features">
              <Button
                variant="outline"
                size="lg"
                className="w-full cursor-pointer sm:w-auto"
              >
                Learn More
              </Button>
            </Link>
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Car className="h-3 w-3" />
              Fleet Tracking
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              Driver Management
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <BarChart3 className="h-3 w-3" />
              Analytics
            </Badge>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="space-y-6 p-4 sm:space-y-8 sm:p-6">
        <div className="space-y-2 text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Everything You Need to Manage Your Fleet
          </h2>
          <p className="text-muted-foreground mx-auto max-w-2xl">
            Our comprehensive fleet management system provides all the tools you
            need to efficiently manage your fleet operations.
          </p>
        </div>

        <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const IconComponent = feature.icon;
            return (
              <Card
                key={feature.title}
                className="group transition-shadow hover:shadow-lg"
              >
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className={`rounded-lg p-2 ${feature.color}`}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Contact Section */}
      <section className="mb-10 space-y-6 p-4 sm:space-y-8 sm:p-6">
        <div className="mx-auto flex h-full min-h-[40vh] max-w-2xl flex-col justify-center space-y-6 text-center">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Get in Touch
            </h2>
            <p className="text-muted-foreground">
              Have questions or need support? We&apos;re here to help you get
              started.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center space-x-3 p-4">
              <div className="bg-primary/10 rounded-lg p-2">
                <Mail className="text-primary h-5 w-5" />
              </div>
              <div className="text-left">
                <p className="font-medium">Email Support</p>
                <a
                  href={`mailto:${BRAND_EMAIL}`}
                  className="text-primary text-sm hover:underline"
                >
                  {BRAND_EMAIL}
                </a>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4">
              <div className="bg-primary/10 rounded-lg p-2">
                <Phone className="text-primary h-5 w-5" />
              </div>
              <div className="text-left">
                <p className="font-medium">Phone Support</p>
                <p className="text-muted-foreground text-sm">+91 1234567890</p>
              </div>
            </div>
          </div>

          <Link href="/auth/sign-in">
            <Button className="w-full cursor-pointer sm:w-auto">
              Start Managing Your Fleet Today
            </Button>
          </Link>
        </div>
      </section>
    </main>
  );
}
