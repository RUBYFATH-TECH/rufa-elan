"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { 
  ArrowRight, Star, ShoppingBag, Truck, Shield, Clock, 
  Users, Award, Sparkles, Heart, Eye, TrendingUp,
  CheckCircle, Quote, Gift, ChevronRight, Zap
} from "lucide-react";

export default function HomePage() {
  return (
    <>
      {/* Modern Hero Section */}
      <section className="relative min-h-screen flex items-center bg-gradient-to-br from-slate-50 via-white to-rose-50 overflow-hidden">
        {/* NEW VERSION INDICATOR */}
        <div className="fixed top-4 right-4 z-50 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-full font-bold shadow-xl animate-pulse">
          ✨ NEW MODERN UI LOADED ✨
        </div>
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-r from-rose-200/30 to-pink-200/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-r from-amber-200/30 to-orange-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              {/* Badge */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white px-6 py-3 rounded-full text-sm font-semibold shadow-lg"
              >
                <Sparkles className="w-4 h-4" />
                <span>Premium Fashion Collection 2024</span>
              </motion.div>

              {/* Main Heading */}
              <div className="space-y-6">
                <h1 className="text-6xl lg:text-7xl font-bold bg-gradient-to-r from-slate-900 via-rose-600 to-slate-900 bg-clip-text text-transparent leading-tight">
                  RUFA ELAN
                </h1>
                <h2 className="text-2xl lg:text-3xl text-slate-700 font-light">
                  Luxury Handbags & Fashion Accessories
                </h2>
                <p className="text-lg text-slate-600 leading-relaxed max-w-xl">
                  Discover our curated collection of premium handbags and fashion accessories. 
                  Crafted for the modern woman who values style, quality, and elegance.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-rose-500 to-pink-500 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span>Shop Collection</span>
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="border-2 border-slate-300 text-slate-700 px-8 py-4 rounded-full font-semibold text-lg hover:bg-slate-50 transition-all duration-300"
                >
                  Watch Our Story
                </motion.button>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center space-x-8 pt-8">
                <div className="flex items-center space-x-2 text-slate-600">
                  <Shield className="w-5 h-5 text-green-500" />
                  <span className="font-medium">Secure Checkout</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-600">
                  <Truck className="w-5 h-5 text-blue-500" />
                  <span className="font-medium">Fast Delivery</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-600">
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  <span className="font-medium">5★ Rated</span>
                </div>
              </div>
            </motion.div>

            {/* Right Content - Hero Image */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative bg-gradient-to-br from-white to-slate-50 rounded-3xl p-8 shadow-2xl">
                {/* Featured Product */}
                <div className="aspect-square bg-slate-100 rounded-2xl overflow-hidden mb-6">
                  <img 
                    src="/images/2026-07-21 at 16.58.28.jpeg" 
                    alt="Featured Handbag"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  />
                </div>
                
                {/* Product Info */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-slate-900">Alaia Leather Tote</h3>
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                      <span className="text-sm text-slate-600 ml-2">4.9</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl font-bold text-slate-900">GHS 280</span>
                      <span className="text-lg text-slate-500 line-through">GHS 320</span>
                      <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-sm font-semibold">12% OFF</span>
                    </div>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    className="w-full bg-slate-900 text-white py-3 rounded-xl font-semibold hover:bg-slate-800 transition-colors"
                  >
                    Add to Cart
                  </motion.button>
                </div>

                {/* Floating Badges */}
                <div className="absolute -top-4 -left-4 bg-gradient-to-r from-green-400 to-emerald-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                  Best Seller
                </div>
                <div className="absolute -top-4 -right-4 bg-gradient-to-r from-orange-400 to-red-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                  Limited Stock
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { number: "15,000+", label: "Happy Customers", icon: Users },
              { number: "99.8%", label: "Satisfaction Rate", icon: Heart },
              { number: "500+", label: "Premium Products", icon: Award },
              { number: "48hrs", label: "Fast Delivery", icon: Clock }
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="bg-gradient-to-r from-rose-500 to-pink-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8" />
                  </div>
                  <div className="text-3xl font-bold mb-2">{stat.number}</div>
                  <div className="text-slate-300">{stat.label}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
                Featured Collection
              </h2>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                Discover our handpicked selection of premium handbags and accessories
              </p>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                name: "Alaia Leather Tote",
                category: "Tote Bags",
                price: 280,
                originalPrice: 320,
                image: "/images/2026-07-21 at 16.58.28.jpeg",
                badge: "Best Seller",
                rating: 4.9
              },
              {
                name: "Mila Crossbody",
                category: "Crossbody Bags", 
                price: 199,
                originalPrice: 220,
                image: "/images/Image 2026-07-21 at 16.58.27.jpeg",
                badge: "New",
                rating: 4.8
              },
              {
                name: "Selene Shoulder Bag",
                category: "Shoulder Bags",
                price: 250,
                originalPrice: 270,
                image: "/images/WhatsApp 2026-07-21 at 16.58.31.jpeg",
                badge: "Limited",
                rating: 4.7
              },
              {
                name: "Noelle Classic Purse",
                category: "Purses",
                price: 130,
                originalPrice: 150,
                image: "/images/WhatsApp Image 2026-07-21 at 16.58.32.jpeg",
                badge: "Trending",
                rating: 4.6
              }
            ].map((product, index) => (
              <motion.div
                key={product.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-slate-100"
              >
                <div className="relative aspect-square bg-slate-50 overflow-hidden">
                  <img 
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  
                  {/* Badge */}
                  <div className="absolute top-4 left-4 bg-slate-900 text-white px-3 py-1 rounded-full text-xs font-semibold">
                    {product.badge}
                  </div>
                  
                  {/* Discount */}
                  <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                    -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                  </div>

                  {/* Hover Actions */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-3">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      className="bg-white/90 p-3 rounded-full shadow-lg"
                    >
                      <Heart className="w-5 h-5 text-slate-700" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      className="bg-white/90 p-3 rounded-full shadow-lg"
                    >
                      <Eye className="w-5 h-5 text-slate-700" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      className="bg-slate-900 p-3 rounded-full shadow-lg"
                    >
                      <ShoppingBag className="w-5 h-5 text-white" />
                    </motion.button>
                  </div>
                </div>

                <div className="p-6 space-y-3">
                  <div className="flex items-center justify-between text-sm text-slate-500">
                    <span className="font-medium">{product.category}</span>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span>{product.rating}</span>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-rose-600 transition-colors">
                    {product.name}
                  </h3>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl font-bold text-slate-900">GHS {product.price}</span>
                      <span className="text-sm text-slate-500 line-through">GHS {product.originalPrice}</span>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      className="bg-rose-100 text-rose-600 p-2 rounded-full hover:bg-rose-200 transition-colors"
                    >
                      <ShoppingBag className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-r from-rose-500 to-pink-500 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              View All Products
            </motion.button>
          </div>
        </div>
      </section>
      {/* Why Choose Us Section */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-rose-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
                Why Choose Rufa Elan?
              </h2>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                Experience luxury, quality, and convenience with every purchase
              </p>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: "Premium Quality",
                description: "Handcrafted with finest materials and attention to detail",
                icon: Award,
                gradient: "from-purple-500 to-indigo-500"
              },
              {
                title: "Fast Shipping",
                description: "Free delivery nationwide within 2-5 business days",
                icon: Truck,
                gradient: "from-blue-500 to-cyan-500"
              },
              {
                title: "Secure Payment",
                description: "256-bit SSL encryption for safe and secure transactions",
                icon: Shield,
                gradient: "from-green-500 to-emerald-500"
              },
              {
                title: "24/7 Support",
                description: "Dedicated customer service team always ready to help",
                icon: Clock,
                gradient: "from-orange-500 to-red-500"
              }
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -10 }}
                  className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 text-center"
                >
                  <div className={`bg-gradient-to-r ${feature.gradient} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Customer Reviews Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
                What Our Customers Say
              </h2>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                Join thousands of satisfied customers who love our products
              </p>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Akosua Mensah",
                location: "Accra, Ghana",
                text: "Absolutely in love with my new handbag! The quality is exceptional and it matches perfectly with all my outfits. Fast delivery too!",
                rating: 5,
                image: "/images/customer-1.jpg"
              },
              {
                name: "Fatima Abdul",
                location: "Kumasi, Ghana",
                text: "Rufa Elan has become my go-to for fashion accessories. Beautiful designs, great prices, and excellent customer service. Highly recommended!",
                rating: 5,
                image: "/images/customer-2.jpg"
              },
              {
                name: "Grace Owusu",
                location: "Takoradi, Ghana",
                text: "The attention to detail is amazing! Every purchase feels like a luxury experience. The packaging is beautiful and delivery is always on time.",
                rating: 5,
                image: "/images/customer-3.jpg"
              }
            ].map((review, index) => (
              <motion.div
                key={review.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-white to-slate-50 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-slate-100"
              >
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                
                <Quote className="w-8 h-8 text-rose-400 mb-4" />
                
                <p className="text-slate-700 leading-relaxed mb-6 italic">
                  "{review.text}"
                </p>
                
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-rose-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {review.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">{review.name}</h4>
                    <p className="text-sm text-slate-500">{review.location}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Order Tracking Section */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <div className="inline-block bg-gradient-to-r from-rose-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                  Track Your Order
                </div>
                <h2 className="text-4xl lg:text-5xl font-bold">
                  Real-time Delivery Tracking
                </h2>
                <p className="text-xl text-slate-300 leading-relaxed">
                  Stay updated with live tracking, detailed timeline, and estimated delivery times for all your orders.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex space-x-4">
                  <input
                    type="text"
                    placeholder="Enter your order number (e.g., RUFA-1001)"
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-6 py-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    className="bg-gradient-to-r from-rose-500 to-pink-500 px-8 py-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center space-x-2"
                  >
                    <Truck className="w-5 h-5" />
                    <span>Track</span>
                  </motion.button>
                </div>
                
                <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                  <span className="cursor-pointer hover:text-white transition-colors">Try: RUFA-1001</span>
                  <span className="cursor-pointer hover:text-white transition-colors">RUFA-1002</span>
                  <span className="cursor-pointer hover:text-white transition-colors">RUFA-1003</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800 rounded-xl p-6 text-center">
                  <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-white mb-1">Live</div>
                  <div className="text-sm text-slate-400">GPS Tracking</div>
                </div>
                <div className="bg-slate-800 rounded-xl p-6 text-center">
                  <CheckCircle className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-white mb-1">Real-time</div>
                  <div className="text-sm text-slate-400">Updates</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="bg-slate-800 rounded-3xl p-8 border border-slate-700"
            >
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-400 font-semibold">Live Tracking Active</span>
                </div>

                {[
                  { step: "Order Confirmed", time: "2 hours ago", status: "completed" },
                  { step: "Package Dispatched", time: "1 hour ago", status: "completed" },
                  { step: "Out for Delivery", time: "30 mins ago", status: "current" },
                  { step: "Delivered", time: "Estimated in 2 hours", status: "pending" }
                ].map((item, index) => (
                  <div key={item.step} className="flex items-center space-x-4">
                    <div className={`w-4 h-4 rounded-full ${
                      item.status === 'completed' ? 'bg-green-400' :
                      item.status === 'current' ? 'bg-rose-400 animate-pulse' :
                      'bg-slate-600'
                    }`}></div>
                    <div className="flex-1">
                      <div className={`font-medium ${
                        item.status === 'completed' ? 'text-white' :
                        item.status === 'current' ? 'text-rose-400' :
                        'text-slate-400'
                      }`}>
                        {item.step}
                      </div>
                      <div className="text-sm text-slate-400">{item.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-gradient-to-r from-rose-500 to-pink-500 text-white">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto space-y-8"
          >
            <Gift className="w-16 h-16 mx-auto text-white/90" />
            
            <div className="space-y-4">
              <h2 className="text-4xl lg:text-5xl font-bold">
                Stay in the Loop
              </h2>
              <p className="text-xl text-white/90 leading-relaxed">
                Be the first to know about new arrivals, exclusive offers, and styling tips from our fashion experts.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 bg-white/10 backdrop-blur border border-white/20 rounded-xl px-6 py-4 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="bg-white text-rose-500 px-8 py-4 rounded-xl font-bold hover:bg-white/90 transition-all duration-300"
              >
                Subscribe
              </motion.button>
            </div>

            <p className="text-sm text-white/70">
              Join 15,000+ fashion lovers. Unsubscribe anytime.
            </p>
          </motion.div>
        </div>
      </section>
    </>
  );
}