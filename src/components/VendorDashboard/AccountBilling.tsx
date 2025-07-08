import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CreditCard, 
  Calendar, 
  DollarSign, 
  Download, 
  Plus, 
  Coins, 
  ArrowUpRight,
  ArrowDownLeft,
  Settings,
  Receipt
} from 'lucide-react';

const AccountBilling = () => {
  const [selectedPlan, setSelectedPlan] = useState('standard');

  // Mock billing data
  const creditBalance = 15;
  const earnedCredits = 8;
  const purchasedCredits = 12;

  const transactions = [
    {
      id: 1,
      type: 'unlock',
      description: 'Contact unlock - John Davis (J.D.)',
      amount: -1,
      date: '2024-03-10',
      status: 'completed'
    },
    {
      id: 2,
      type: 'purchase',
      description: 'Credit bundle purchase (10 credits)',
      amount: +10,
      paymentAmount: 99.00,
      date: '2024-03-08',
      status: 'completed'
    },
    {
      id: 3,
      type: 'referral',
      description: 'Referral reward - Sarah Miller joined',
      amount: +1,
      date: '2024-03-05',
      status: 'completed'
    },
    {
      id: 4,
      type: 'unlock',
      description: 'Contact unlock - Robert Wilson (R.W.)',
      amount: -1,
      date: '2024-03-03',
      status: 'completed'
    },
    {
      id: 5,
      type: 'purchase',
      description: 'Credit bundle purchase (5 credits)',
      amount: +5,
      paymentAmount: 49.00,
      date: '2024-02-28',
      status: 'completed'
    }
  ];

  const creditPackages = [
    {
      id: 'starter',
      name: 'Starter Pack',
      credits: 5,
      price: 49,
      pricePerCredit: 9.80,
      popular: false
    },
    {
      id: 'standard',
      name: 'Standard Pack',
      credits: 10,
      price: 89,
      pricePerCredit: 8.90,
      popular: true,
      savings: 9
    },
    {
      id: 'professional',
      name: 'Professional Pack',
      credits: 25,
      price: 199,
      pricePerCredit: 7.96,
      popular: false,
      savings: 19
    },
    {
      id: 'enterprise',
      name: 'Enterprise Pack',
      credits: 50,
      price: 349,
      pricePerCredit: 6.98,
      popular: false,
      savings: 29
    }
  ];

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'unlock':
        return <ArrowDownLeft className="h-4 w-4 text-red-500" />;
      case 'purchase':
        return <ArrowUpRight className="h-4 w-4 text-green-500" />;
      case 'referral':
        return <ArrowUpRight className="h-4 w-4 text-blue-500" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'unlock':
        return 'text-red-600';
      case 'purchase':
      case 'referral':
        return 'text-green-600';
      default:
        return 'text-foreground';
    }
  };

  return (
    <div className="space-y-6">
      {/* Account Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <Coins className="h-8 w-8 mx-auto mb-3 text-primary" />
            <div className="text-3xl font-bold text-primary">{creditBalance}</div>
            <div className="text-sm text-muted-foreground">Current Balance</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <ArrowUpRight className="h-8 w-8 mx-auto mb-3 text-green-500" />
            <div className="text-3xl font-bold text-foreground">{earnedCredits}</div>
            <div className="text-sm text-muted-foreground">Earned Credits</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <CreditCard className="h-8 w-8 mx-auto mb-3 text-blue-500" />
            <div className="text-3xl font-bold text-foreground">{purchasedCredits}</div>
            <div className="text-sm text-muted-foreground">Purchased Credits</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="purchase" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="purchase">Purchase Credits</TabsTrigger>
          <TabsTrigger value="transactions">Transaction History</TabsTrigger>
          <TabsTrigger value="settings">Billing Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="purchase">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Purchase Credits
              </CardTitle>
              <CardDescription>
                Buy credits to unlock Field Rep contact information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {creditPackages.map((pkg) => (
                  <Card 
                    key={pkg.id}
                    className={`relative cursor-pointer transition-all ${
                      selectedPlan === pkg.id 
                        ? 'border-primary shadow-lg' 
                        : 'border-muted hover:border-muted-foreground'
                    }`}
                    onClick={() => setSelectedPlan(pkg.id)}
                  >
                    {pkg.popular && (
                      <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                        Most Popular
                      </Badge>
                    )}
                    <CardContent className="p-6 text-center">
                      <h3 className="font-semibold text-lg mb-2">{pkg.name}</h3>
                      <div className="text-3xl font-bold text-primary mb-1">
                        {pkg.credits}
                      </div>
                      <div className="text-sm text-muted-foreground mb-4">Credits</div>
                      
                      <div className="text-2xl font-bold mb-1">${pkg.price}</div>
                      <div className="text-sm text-muted-foreground mb-3">
                        ${pkg.pricePerCredit.toFixed(2)} per credit
                      </div>
                      
                      {pkg.savings && (
                        <Badge variant="secondary" className="mb-4">
                          Save {pkg.savings}%
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-muted/20 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold">
                      {creditPackages.find(p => p.id === selectedPlan)?.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {creditPackages.find(p => p.id === selectedPlan)?.credits} credits
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      ${creditPackages.find(p => p.id === selectedPlan)?.price}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      ${creditPackages.find(p => p.id === selectedPlan)?.pricePerCredit.toFixed(2)} per credit
                    </div>
                  </div>
                </div>
                <Button className="w-full" size="lg">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Purchase Credits
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Receipt className="h-5 w-5" />
                    Transaction History
                  </CardTitle>
                  <CardDescription>
                    View your credit purchases and usage history
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border border-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      {getTransactionIcon(transaction.type)}
                      <div>
                        <div className="font-medium">{transaction.description}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          {new Date(transaction.date).toLocaleDateString()}
                          <Badge variant="outline" className="text-xs">
                            {transaction.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`font-semibold ${getTransactionColor(transaction.type)}`}>
                        {transaction.amount > 0 ? '+' : ''}{transaction.amount} credits
                      </div>
                      {transaction.paymentAmount && (
                        <div className="text-sm text-muted-foreground">
                          ${transaction.paymentAmount.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {transactions.length === 0 && (
                <div className="text-center py-12">
                  <Receipt className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Transactions</h3>
                  <p className="text-muted-foreground">
                    Your transaction history will appear here once you start using credits.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Billing Settings
              </CardTitle>
              <CardDescription>
                Manage your payment methods and billing preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Payment Methods */}
              <div>
                <h3 className="font-semibold mb-3">Payment Methods</h3>
                <div className="border border-dashed border-muted rounded-lg p-6 text-center">
                  <CreditCard className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-muted-foreground mb-3">No payment methods added</p>
                  <Button variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Payment Method
                  </Button>
                </div>
              </div>
              
              {/* Billing Information */}
              <div>
                <h3 className="font-semibold mb-3">Billing Information</h3>
                <div className="border border-dashed border-muted rounded-lg p-6 text-center">
                  <Receipt className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-muted-foreground mb-3">No billing information on file</p>
                  <Button variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    Add Billing Details
                  </Button>
                </div>
              </div>
              
              {/* Auto-recharge */}
              <div>
                <h3 className="font-semibold mb-3">Auto-Recharge</h3>
                <div className="bg-muted/20 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Automatic Credit Recharge</div>
                      <div className="text-sm text-muted-foreground">
                        Automatically purchase credits when balance is low
                      </div>
                    </div>
                    <Badge variant="secondary">Disabled</Badge>
                  </div>
                  <Button variant="outline" className="mt-3">
                    Set Up Auto-Recharge
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AccountBilling;