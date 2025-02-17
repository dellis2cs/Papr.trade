"use client"
import { Link } from "react-router"
import type React from "react"
import { motion } from "framer-motion"
import { ArrowRight, BarChart2, Wallet, Zap, Shield } from "lucide-react"
import { Button } from "../components/ui/button"

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#030307] text-white overflow-hidden">
      {/* Background patterns */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-b from-transparent via-blue-900/10 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Navigation */}
        <header className="border-b border-white/5 backdrop-blur-sm sticky top-0">
          <nav className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xl  bg-white from-blue-400 to-purple-400 bg-clip-text text-transparent"
            >
              Papr
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-6">
              <Link to="/login">
                  <Button variant="ghost" className="hover:text-white hover:scale-105 transition-all duration-150 hover:bg-[#111129]  border border-neutral-700">
                    Login
                  </Button>
              </Link>
              <Link to="/Signup">
                  <Button variant="ghost" className="hover:text-white hover:scale-105 transition-all duration-150 hover:bg-[#526fff]  border border-neutral-700 bg-[#526fff] text-black">
                    SignUp
                  </Button>
              </Link>
            </motion.div>
          </nav>
        </header>

        {/* Hero Section */}
        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl mx-auto text-center"
            >
              <h1 className="text-5xl sm:text-6xl font-bold mb-6 bg-gradient-to-br from-white via-blue-100 to-blue-200 bg-clip-text text-transparent font-medium">
                Trade Crypto with Confidence
              </h1>
              <p className="text-lg text-white/60 mb-8">
                Hone your strategy in a realistic, risk-free simulation. Get insights and execute with speed.
              </p>
              <Link to="/SignUp">
                  <Button
                    size="lg"
                    className="bg-[#526fff] text-black hover:bg-[#526fff] border border-neutral-700 text-lg px-7 py-6 rounded-2xl h-12 hover:scale-105 transition-all duration-200"
                  >
                    Begin Simulation
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 px-6 border-t border-white/5 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              <FeatureCard
                icon={<BarChart2 className="h-6 w-6" />}
                title="Live Insights"
                description="Access real-time market updates to refine your strategy."
              />
              <FeatureCard
                icon={<Wallet className="h-6 w-6" />}
                title="Virtual Wallet"
                description="Practice with simulated funds in a secure environment."
              />
              <FeatureCard
                icon={<Zap className="h-6 w-6" />}
                title="Rapid Execution"
                description="Experience fast, lag-free order execution."
              />
              <FeatureCard
                icon={<Shield className="h-6 w-6" />}
                title="Zero Risk"
                description="Test your moves without exposing real assets."
              />
            </motion.div>
          </div>
        </section>

        {/* Platform Preview */}
        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="relative rounded-xl overflow-hidden border border-white/10"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-[#030307] via-transparent to-transparent" />
              <img
                src="/placeholder.svg?height=1080&width=1920"
                alt="Trading Platform Interface"
                className="w-full h-auto"
              />
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="p-6 rounded-xl border border-white/5 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors"
    >
      <div className="bg-transparent border border-neutral-700 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-white/60">{description}</p>
    </motion.div>
  )
}
