// "use client";
// import { Link } from "react-router-dom";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "../components/ui/Card";
// import Badge from "../components/ui/Badge";
// import {
//   DollarSign,
//   Package,
//   ShoppingCart,
//   Users,
//   TrendingUp,
//   TrendingDown,
// } from "lucide-react";

// // You can fetch these values from actual state/store and pass them here
// const totalRevenue = "$45,231.89";
// const totalOrders = 2350; // replace with actual order count
// const totalProducts = 1234; // replace with actual product count
// const activeCustomers = 573;

// const Dashboard = () => {
//   const stats = [
//     {
//       title: "Total Revenue",
//       value: totalRevenue,
//       change: "+20.1%",
//       trend: "up",
//       icon: DollarSign,
//     },
//     {
//       title: "Total Orders",
//       value: totalOrders.toString(),
//       change: "+180.1%",
//       trend: "up",
//       icon: ShoppingCart,
//       link: "/orders",
//     },
//     {
//       title: "Products",
//       value: totalProducts.toString(),
//       change: "+19%",
//       trend: "up",
//       icon: Package,
//       link: "/products",
//     },
//     {
//       title: "Active Customers",
//       value: activeCustomers.toString(),
//       change: "+201",
//       trend: "up",
//       icon: Users,
//       link: "/customers",
//     },
//   ];

//   const orderStatus = [
//     { status: "Pending", count: 45, color: "bg-yellow-500" },
//     { status: "Processing", count: 50, color: "bg-blue-500" },
//     { status: "Shipped", count: 258, color: "bg-purple-500" },
//     { status: "Delivered", count: 500, color: "bg-green-500" },
//     { status: "Returned", count: 300, color: "bg-red-500" },
//   ];

//   const topProducts = [
//     { name: "Wireless Headphones", sales: 1234, revenue: "$24,680" },
//     { name: "Smart Watch", sales: 987, revenue: "$19,740" },
//     { name: "Laptop Stand", sales: 756, revenue: "$15,120" },
//     { name: "USB-C Cable", sales: 654, revenue: "$6,540" },
//     { name: "Phone Case", sales: 543, revenue: "$8,145" },
//   ];

//   const maxCount = Math.max(...orderStatus.map((o) => o.count));

//   return (
//     <div className="space-y-6 px-4 py-4">
//       {/* Heading */}
//       <div>
//         <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
//         <p className="text-muted-foreground" style={{ marginTop: "5px" }}>
//           Welcome back! Here's what's happening with your store today.
//         </p>
//       </div>

//       {/* Stats Cards */}
//       <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
//         {stats.map((stat) => {
//           const content = (
//             <Card key={stat.title} className="cursor-pointer">
//               <CardHeader className="flex flex-row  space-x-4 pb-2">
//                 <CardTitle className="text-sm font-medium">
//                   {stat.title}
//                 </CardTitle>
//                 <stat.icon
//                   className="h-4 w-4 text-muted-foreground"
//                   style={{ marginLeft: "-1px" }}
//                 />
//               </CardHeader>
//               <CardContent>
//                 <div className="text-2xl font-bold">{stat.value}</div>
//                 <p className="text-xs text-muted-foreground flex items-center">
//                   {stat.trend === "up" ? (
//                     <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
//                   ) : (
//                     <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
//                   )}
//                   {stat.change} from last month
//                 </p>
//               </CardContent>
//             </Card>
//           );

//           return stat.link ? (
//             <Link key={stat.title} to={stat.link}>
//               {content}
//             </Link>
//           ) : (
//             content
//           );
//         })}
//       </div>

//       <div className="grid gap-4 lg:grid-cols-7">
//         {/* Order Status Breakdown */}
//         <Card className="lg:col-span-4">
//           <CardHeader>
//             <CardTitle>Order Status Breakdown</CardTitle>
//             <CardDescription>Current status of all orders</CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             {orderStatus.map((order) => {
//               const barWidth = (order.count / maxCount) * 100;
//               return (
//                 <div
//                   key={order.status}
//                   className="flex items-center justify-between"
//                 >
//                   <div className="flex items-center space-x-2">
//                     <div className={`w-3 h-3 rounded-full ${order.color}`} />
//                     <span className="text-sm font-medium">{order.status}</span>
//                   </div>
//                   <div className="flex items-center space-x-2 w-1/2">
//                     <Badge variant="secondary">{order.count}</Badge>
//                     <div className="w-full bg-gray-200 rounded-full h-2">
//                       <div
//                         className={`${order.color} h-2 rounded-full transition-all duration-300`}
//                         style={{ width: `${barWidth}%` }}
//                       />
//                     </div>
//                   </div>
//                 </div>
//               );
//             })}
//           </CardContent>
//         </Card>

//         {/* Top Products */}
//         <Card className="lg:col-span-3">
//           <CardHeader>
//             <CardTitle>Top Products</CardTitle>
//             <CardDescription>
//               Best performing products this month
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-4">
//               {topProducts.map((product, index) => (
//                 <div
//                   key={product.name}
//                   className="flex items-center justify-between"
//                 >
//                   <div className="flex items-center space-x-2">
//                     <div className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center text-xs font-medium text-red-600">
//                       {index + 1}
//                     </div>
//                     <div>
//                       <p className="text-sm font-medium">{product.name}</p>
//                       <p className="text-xs text-muted-foreground">
//                         {product.sales} sales
//                       </p>
//                     </div>
//                   </div>
//                   <div className="text-sm font-medium">{product.revenue}</div>
//                 </div>
//               ))}
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;
//
// code with proper working

"use client";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import StatsCard from "../components/common/StatsCard";
import OrderStatusCard from "../components/common/OrderStatusCard";
import ProductCard from "../components/common/ProductCard";
import {
  DollarSign,
  IndianRupee,
  Package,
  ShoppingCart,
  Users,
} from "lucide-react";

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://tyka.premierhostings.com/beta/api/dashboard")
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch dashboard data:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="p-4">Loading dashboard...</div>;
  }

  if (!data) {
    return (
      <div className="p-4 text-red-500">Failed to load dashboard data.</div>
    );
  }

  const {
    total_revenue,
    total_orders,
    products,
    active_customers,
    growth,
    order_status,
    top_products,
  } = data;

  const stats = [
    {
      title: "Total Revenue",
      value: `₹ ${total_revenue.toLocaleString()}`,
      // change: `${growth.revenue >= 0 ? "+" : ""}${growth.revenue}%`,
      // trend: growth.revenue >= 0 ? "up" : "down",
      icon: IndianRupee,
    },
    {
      title: "Total Orders",
      value: total_orders.toString(),
      change: `${growth.orders >= 0 ? "+" : ""}${growth.orders}%`,
      trend: growth.orders >= 0 ? "up" : "down",
      icon: ShoppingCart,
      link: "/orders",
    },
    {
      title: "Products",
      value: products.toString(),
      change: `${growth.products >= 0 ? "+" : ""}${growth.products}%`,
      trend: growth.products >= 0 ? "up" : "down",
      icon: Package,
      link: "/products",
    },
    {
      title: "Active Customers",
      value: active_customers.toString(),
      change: `${growth.customers >= 0 ? "+" : ""}${growth.customers}`,
      trend: growth.customers >= 0 ? "up" : "down",
      icon: Users,
      link: "/customers",
    },
  ];

  const orderStatus = [
    { status: "Pending", count: order_status.pending, color: "bg-yellow-500" },
    {
      status: "Processing",
      count: order_status.processing,
      color: "bg-blue-500",
    },
    { status: "Shipped", count: order_status.shipped, color: "bg-purple-500" },
    {
      status: "Delivered",
      count: order_status.delivered,
      color: "bg-green-500",
    },
    { status: "Cancelled", count: order_status.returned, color: "bg-red-500" },
  ];

  const maxCount = Math.max(...orderStatus.map((o) => o.count));

  const topProducts = top_products.map((product) => ({
    name: product.product_name,
    sales: parseInt(product.sales),
    revenue: `₹${Number(product.revenue).toLocaleString()}`,
  }));

  return (
    <div className="space-y-6 px-4 py-4">
      {/* Heading */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground" style={{ marginTop: "5px" }}>
          Welcome back! Here's what's happening with your store today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const content = <StatsCard key={stat.title} stat={stat} />;
          return stat.link ? (
            <Link key={stat.title} to={stat.link}>
              {content}
            </Link>
          ) : (
            content
          );
        })}
      </div>

      {/* Order Status + Top Products */}
      <div className="grid gap-4 lg:grid-cols-7">
        <OrderStatusCard
          title="Order Status Breakdown"
          description="Current status of all orders"
          orderStatus={orderStatus}
          maxCount={maxCount}
        />
        <ProductCard
          title="Top Products"
          description="Best performing products this month"
          topProducts={topProducts}
        />
      </div>
    </div>
  );
};

export default Dashboard;
