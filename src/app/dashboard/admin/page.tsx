import { redirect } from "next/navigation";
import Header from "@/app/_components/Header";
// import AdminSidebar from "@/app/dashboard/UserSidebar";

export default function AdminDashboard() {
  // This is just a placeholder - in a real app you might fetch data here
  const stats = [
    {
      name: "Total Users",
      value: "1,234",
      change: "+12%",
      changeType: "positive",
    },
    {
      name: "Total Products",
      value: "567",
      change: "+5%",
      changeType: "positive",
    },
    {
      name: "Pending Orders",
      value: "24",
      change: "-3%",
      changeType: "negative",
    },
    {
      name: "Revenue",
      value: "$12,345",
      change: "+18%",
      changeType: "positive",
    },
  ];

  return (
    <div className="space-y-6">
      {/* <AdminSidebar /> */}
      <Header />
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">{stat.name}</h3>
            <p className="mt-1 text-2xl font-semibold">{stat.value}</p>
            <p
              className={`mt-1 text-sm ${
                stat.changeType === "positive"
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {stat.change}
            </p>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="border-b pb-3 last:border-b-0">
              <p className="font-medium">New order #{1000 + item} received</p>
              <p className="text-sm text-gray-500">2 hours ago</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// export default function AdminDashboard() {
//     return (
//         <div>Admin</div>
//     );
// }
