import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  BarChart3, 
  Activity, 
  Award, 
  Shield, 
  Code, 
  LineChart 
} from "lucide-react";

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="py-12 md:py-20 bg-gradient-to-br from-primary to-primary-dark text-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
                Track Your LeetCode Progress Like Never Before
              </h1>
              <p className="text-lg md:text-xl mb-6 text-gray-100">
                Visualize your coding journey, monitor improvements, and showcase your skills with our intuitive dashboard.
              </p>
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                <Link href="/signup">
                  <Button size="lg" className="py-3 px-6 bg-white text-primary hover:bg-gray-100 font-semibold rounded-lg shadow-lg transition duration-200 transform hover:-translate-y-1">
                    Get Started
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="py-3 px-6 bg-transparent hover:bg-white/10 text-white font-semibold border border-white rounded-lg transition duration-200">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="rounded-lg shadow-2xl max-w-full h-auto bg-gray-800 p-4 border border-gray-700">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <div className="flex-1 text-center text-sm text-gray-300">LeetCode Stats Dashboard</div>
                </div>
                <div className="bg-gray-900 rounded p-4 text-gray-300 font-mono text-sm">
                  <div className="flex justify-between mb-3">
                    <span>Problems Solved: <span className="text-green-400">253</span></span>
                    <span>Rank: <span className="text-yellow-400">Top 10%</span></span>
                  </div>
                  <div className="space-y-1 mb-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-green-400">Easy</span>
                      <span>120/592</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-1.5">
                      <div className="bg-green-500 h-1.5 rounded-full" style={{ width: "20%" }}></div>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-yellow-400">Medium</span>
                      <span>98/1256</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-1.5">
                      <div className="bg-yellow-500 h-1.5 rounded-full" style={{ width: "8%" }}></div>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-red-400">Hard</span>
                      <span>35/516</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-1.5">
                      <div className="bg-red-500 h-1.5 rounded-full" style={{ width: "7%" }}></div>
                    </div>
                  </div>
                  <div className="text-center text-xs text-gray-500 mt-2">
                    Visualize your LeetCode journey with CodeTrack
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">Why CodeTrack?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Visual Progress Tracking</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Interactive charts and graphs that visualize your LeetCode journey and highlight your improvements over time.
              </p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-secondary/10 dark:bg-secondary/20 rounded-full flex items-center justify-center mb-4">
                <Activity className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Activity Insights</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Get detailed activity heatmaps and statistics to understand your coding patterns and consistency.
              </p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-accent/10 dark:bg-accent/20 rounded-full flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure & Private</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Your data is securely stored and never shared with third parties. Access your stats from anywhere, anytime.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features List */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">Features That Make a Difference</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            <div className="flex items-start">
              <div className="flex-shrink-0 mr-4">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Problem Breakdown Analysis</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  See your solved problem distribution across easy, medium, and hard categories with visual indicators.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 mr-4">
                <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                  <Activity className="h-5 w-5 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Activity Heatmap</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Track your coding consistency with a GitHub-style heatmap showing your daily activity patterns.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 mr-4">
                <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
                  <Code className="h-5 w-5 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Language Proficiency</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  View your programming language usage statistics to identify your strengths and diversify your skills.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 mr-4">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <Award className="h-5 w-5 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Badge Collection</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Showcase your earned LeetCode badges and achievements in an organized, visual gallery.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 mr-4">
                <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                  <LineChart className="h-5 w-5 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Contest Performance</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Track your performance in LeetCode contests with detailed statistics and historical trends.
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <Link href="/signup">
              <Button className="py-3 px-8 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg shadow-md transition duration-200">
                Get Started Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-2">Ready to supercharge your LeetCode experience?</h2>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-8">
            Sign up today and get immediate access to your personalized dashboard.
          </p>
          
          <div className="max-w-md mx-auto">
            <form className="bg-gray-50 dark:bg-gray-700 p-8 rounded-lg shadow-lg">
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Email
                </label>
                <Input 
                  type="email" 
                  id="email" 
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary dark:focus:ring-secondary focus:border-transparent" 
                  placeholder="Enter your email" 
                />
              </div>
              <div className="mb-6">
                <Link href="/signup">
                  <Button className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-md shadow-md transition duration-200">
                    Get Early Access
                  </Button>
                </Link>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                By signing up, you agree to our Terms of Service and Privacy Policy.
              </p>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
