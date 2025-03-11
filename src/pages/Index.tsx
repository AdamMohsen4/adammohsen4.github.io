
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import NavBar from "@/components/layout/NavBar";
import { useUser } from "@clerk/clerk-react";
import { useTranslation } from "react-i18next";
import { ArrowRight, Package, Shield, LineChart, CheckCircle, Truck, Map, ShoppingCart } from "lucide-react";
import PartnersCarousel from "@/components/home/PartnersCarousel";

const Index = () => {
  const { isSignedIn } = useUser();
  const { t } = useTranslation();
  
  return <div className="min-h-screen bg-background">
      <NavBar />

      {/* Hero section */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 -z-10" />
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-in">
              <div className="inline-block bg-primary/10 px-4 py-2 rounded-full text-primary font-medium text-sm mb-2">
                {t('home.hero.badge')}
              </div>
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
                {t('home.hero.title')}
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                {t('home.hero.description')}
              </p>
              <div className="pt-6 flex flex-wrap gap-4">
                <Button size="lg" className="group animate-slide-in-right" asChild>
                  <Link to="/book" className="mx-0">
                    {t('home.hero.bookButton')}
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                {isSignedIn ? <Button size="lg" variant="outline" className="animate-slide-in-right [animation-delay:100ms]" asChild>
                    <Link to="/dashboard">{t('home.hero.viewDashboard')}</Link>
                  </Button> : <Button size="lg" variant="outline" className="animate-slide-in-right [animation-delay:100ms]" onClick={() => document.querySelector<HTMLButtonElement>("button.cl-userButtonTrigger")?.click()}>
                    {t('common.signIn')}
                  </Button>}
              </div>
            </div>
            <div className="relative rounded-lg overflow-hidden shadow-2xl animate-fade-in">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent" />
              <img 
                alt="E-Parcel Logistics Facility Aerial View" 
                className="w-full h-auto rounded-lg transform transition-transform hover:scale-105 duration-700" 
                src="uploads/40bf477a-ad0b-486e-9a0d-83c1aff0401a.png" 
              />
            </div>
          </div>
        </div>
      </section>

      {/* Benefits section - NEW */}
      <section className="py-16 bg-secondary/10">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-center space-x-4 animate-fade-in [animation-delay:100ms]">
              <div className="bg-primary/10 p-3 rounded-full">
                <CheckCircle className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">{t('home.benefits.reliable.title')}</h3>
                <p className="text-muted-foreground">{t('home.benefits.reliable.description')}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 animate-fade-in [animation-delay:200ms]">
              <div className="bg-primary/10 p-3 rounded-full">
                <Truck className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">{t('home.benefits.fast.title')}</h3>
                <p className="text-muted-foreground">{t('home.benefits.fast.description')}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 animate-fade-in [animation-delay:300ms]">
              <div className="bg-primary/10 p-3 rounded-full">
                <Map className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">{t('home.benefits.coverage.title')}</h3>
                <p className="text-muted-foreground">{t('home.benefits.coverage.description')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
              {t('home.features.title')}
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('home.features.description')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="group hover:shadow-xl transition-all duration-300 border-t-4 border-primary animate-fade-in [animation-delay:100ms] px-0">
              <CardHeader>
                <Package className="h-10 w-10 text-primary mb-4" />
                <CardTitle>{t('home.features.fixedRate.title')}</CardTitle>
                <CardDescription>{t('home.features.fixedRate.subtitle')}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="group-hover:text-primary transition-colors">{t('home.features.fixedRate.description')}</p>
              </CardContent>
            </Card>
            
            <Card className="group hover:shadow-xl transition-all duration-300 border-t-4 border-primary animate-fade-in [animation-delay:200ms]">
              <CardHeader>
                <Shield className="h-10 w-10 text-primary mb-4" />
                <CardTitle>{t('home.features.tracking.title')}</CardTitle>
                <CardDescription>{t('home.features.tracking.subtitle')}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="group-hover:text-primary transition-colors">{t('home.features.tracking.description')}</p>
              </CardContent>
            </Card>
            
            <Card className="group hover:shadow-xl transition-all duration-300 border-t-4 border-primary animate-fade-in [animation-delay:300ms]">
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
      
      {/* NEW: E-commerce Integration section */}
      <section className="py-24 bg-gradient-to-b from-background via-primary/5 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12 animate-fade-in">
              <div className="inline-block bg-primary/10 px-4 py-2 rounded-full text-primary font-medium text-sm mb-2">
                For Online Retailers
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Add "Ship with E-Parsel" to Your Store
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Seamlessly integrate our shipping services into your e-commerce checkout with just a few lines of code.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-background/90 to-background/70 backdrop-blur-sm animate-fade-in">
                <CardContent className="p-0">
                  <div className="p-8">
                    <div className="flex items-center gap-3 mb-6 text-primary">
                      <ShoppingCart className="h-6 w-6" />
                      <h3 className="text-xl font-semibold">E-commerce Integration</h3>
                    </div>
                    
                    <ul className="space-y-3 mb-8">
                      <li className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        <span>Add a "Ship with E-Parsel" button to your checkout</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        <span>Automatically sync orders and shipping details</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        <span>Special discounted rates for e-commerce orders</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        <span>Works with Shopify, WooCommerce, Magento and more</span>
                      </li>
                    </ul>
                    
                    <div className="p-4 bg-muted rounded-md mb-6">
                      <code className="text-sm text-muted-foreground whitespace-nowrap overflow-x-auto block">
                        &lt;script src="https://cdn.e-parsel.com/integration.js"&gt;&lt;/script&gt;
                      </code>
                    </div>
                    
                    <Button className="w-full" size="lg" asChild>
                      <Link to="/ecommerce-integration">
                        Get Your Integration Code
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <div className="relative rounded-lg overflow-hidden shadow-2xl animate-fade-in">
                <div className="aspect-[4/3] bg-gradient-to-tr from-primary/10 to-background/80 flex items-center justify-center">
                  <div className="w-4/5 bg-white rounded-lg shadow-lg p-6">
                    <div className="space-y-4 mb-6">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">Cart Summary</h4>
                        <span className="text-sm text-muted-foreground">3 items</span>
                      </div>
                      <div className="space-y-2 pb-4 border-b">
                        <div className="flex justify-between">
                          <span>Subtotal</span>
                          <span>€75.00</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tax</span>
                          <span>€15.00</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Shipping</span>
                          <span>€8.00</span>
                        </div>
                      </div>
                      <div className="flex justify-between font-bold">
                        <span>Total</span>
                        <span>€98.00</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-3">
                      <button className="bg-blue-600 text-white py-2 px-4 rounded-md font-medium">
                        Proceed to Checkout
                      </button>
                      <div className="relative flex items-center justify-center">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t border-gray-200" />
                        </div>
                        <span className="relative bg-white px-2 text-xs text-gray-500">
                          or
                        </span>
                      </div>
                      <button className="inline-flex items-center justify-center gap-2 py-2 px-4 bg-gray-900 text-white rounded-md text-sm font-medium">
                        <Package className="h-4 w-4" />
                        Ship with E-Parsel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <Card className="p-8 shadow-lg animate-fade-in border-none bg-gradient-to-r from-background/90 to-background/70 backdrop-blur-sm">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">{t('home.cta.title')}</h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              {t('home.cta.description')}
            </p>
            <Button size="lg" className="group animate-scale-in" asChild>
              <Link to="/book">
                {t('home.cta.button')}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </Card>
        </div>
      </section>

      {/* Partners Carousel section */}
      <section className="py-16">
        <PartnersCarousel speed={45} />
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
                {isSignedIn && <>
                    <li><Link to="/tracking" className="text-muted-foreground hover:text-primary">{t('nav.tracking')}</Link></li>
                    <li><Link to="/compliance" className="text-muted-foreground hover:text-primary">{t('nav.compliance')}</Link></li>
                    <li><Link to="/dashboard" className="text-muted-foreground hover:text-primary">{t('nav.dashboard')}</Link></li>
                  </>}
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">{t('footer.company')}</h4>
              <ul className="space-y-2">
                <li><Link to="/about" className="text-muted-foreground hover:text-primary">{t('footer.about')}</Link></li>
                <li><Link to="/contact" className="text-muted-foreground hover:text-primary">{t('footer.contact')}</Link></li>
                <li><Link to="/terms" className="text-muted-foreground hover:text-primary">{t('footer.terms')}</Link></li>
                <li><Link to="/ecommerce-integration" className="text-muted-foreground hover:text-primary">E-commerce Integration</Link></li>
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
    </div>;
};

export default Index;
