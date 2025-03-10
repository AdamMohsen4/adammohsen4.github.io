
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import NavBar from "@/components/layout/NavBar";
import { useUser } from "@clerk/clerk-react";
import { useTranslation } from "react-i18next";
import { ArrowRight, Package, Shield, LineChart } from "lucide-react";

const Index = () => {
  const { isSignedIn } = useUser();
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen bg-background">
      <NavBar />

      {/* Hero section */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 -z-10" />
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-in">
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
                {t('home.hero.title')}
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                {t('home.hero.description')}
              </p>
              <div className="pt-6 flex flex-wrap gap-4">
                <Button size="lg" className="group animate-slide-right" asChild>
                  <Link to="/book">
                    {t('home.hero.bookButton')}
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                {isSignedIn ? (
                  <Button size="lg" variant="outline" className="animate-slide-right" asChild>
                    <Link to="/dashboard">{t('home.hero.viewDashboard')}</Link>
                  </Button>
                ) : (
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="animate-slide-right"
                    onClick={() => document.querySelector<HTMLButtonElement>("button.cl-userButtonTrigger")?.click()}
                  >
                    {t('common.signIn')}
                  </Button>
                )}
              </div>
            </div>
            <div className="relative rounded-lg overflow-hidden shadow-2xl animate-fade-in">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent" />
              <img 
                src="https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?auto=format&fit=crop&q=80" 
                alt="Logistics" 
                className="w-full h-auto rounded-lg transform transition-transform hover:scale-105 duration-700"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features section */}
      <section className="py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
              {t('home.features.title')}
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('home.features.description')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="group hover:shadow-xl transition-all duration-300 animate-slide-up">
              <CardHeader>
                <Package className="h-10 w-10 text-primary mb-4" />
                <CardTitle>{t('home.features.fixedRate.title')}</CardTitle>
                <CardDescription>{t('home.features.fixedRate.subtitle')}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="group-hover:text-primary transition-colors">{t('home.features.fixedRate.description')}</p>
              </CardContent>
            </Card>
            
            <Card className="group hover:shadow-xl transition-all duration-300 animate-slide-up [animation-delay:200ms]">
              <CardHeader>
                <Shield className="h-10 w-10 text-primary mb-4" />
                <CardTitle>{t('home.features.tracking.title')}</CardTitle>
                <CardDescription>{t('home.features.tracking.subtitle')}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="group-hover:text-primary transition-colors">{t('home.features.tracking.description')}</p>
              </CardContent>
            </Card>
            
            <Card className="group hover:shadow-xl transition-all duration-300 animate-slide-up [animation-delay:400ms]">
              <CardHeader>
                <LineChart className="h-10 w-10 text-primary mb-4" />
                <CardTitle>{t('home.features.dashboard.title')}</CardTitle>
                <CardDescription>{t('home.features.dashboard.subtitle')}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="group-hover:text-primary transition-colors">{t('home.features.dashboard.description')}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <h2 className="text-4xl font-bold mb-6 animate-fade-in">{t('home.cta.title')}</h2>
          <p className="text-xl text-muted-foreground mb-8 animate-fade-in [animation-delay:200ms]">
            {t('home.cta.description')}
          </p>
          <Button size="lg" className="group animate-fade-in [animation-delay:400ms]" asChild>
            <Link to="/book">
              {t('home.cta.button')}
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">E-Parsel</h3>
              <p className="text-muted-foreground">{t('footer.description')}</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">{t('footer.services')}</h4>
              <ul className="space-y-2">
                <li><Link to="/book" className="text-muted-foreground hover:text-primary">{t('nav.book')}</Link></li>
                {isSignedIn && (
                  <>
                    <li><Link to="/tracking" className="text-muted-foreground hover:text-primary">{t('nav.tracking')}</Link></li>
                    <li><Link to="/compliance" className="text-muted-foreground hover:text-primary">{t('nav.compliance')}</Link></li>
                    <li><Link to="/dashboard" className="text-muted-foreground hover:text-primary">{t('nav.dashboard')}</Link></li>
                  </>
                )}
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">{t('footer.company')}</h4>
              <ul className="space-y-2">
                <li><Link to="/about" className="text-muted-foreground hover:text-primary">{t('footer.about')}</Link></li>
                <li><Link to="/contact" className="text-muted-foreground hover:text-primary">{t('footer.contact')}</Link></li>
                <li><Link to="/terms" className="text-muted-foreground hover:text-primary">{t('footer.terms')}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">{t('footer.contact')}</h4>
              <address className="not-italic text-muted-foreground">
                <p>{t('footer.contactInfo.email')} info@e-parsel.com</p>
                <p>{t('footer.contactInfo.phone')} +46 123 456 789</p>
                <p>{t('footer.contactInfo.address')} Malmö, Sweden</p>
              </address>
            </div>
          </div>
          <div className="border-t border-border mt-12 pt-6 text-center text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} E-Parsel. {t('footer.rights')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
