import { useEffect } from "react";
import MemberLayout from "../Components/dashbordsComp/MemberLayout";
import Card from "../Components/dashbordsComp/Cards";
import Table from"../Components/dashbordsComp/Table";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const columns = ["Date", "Type", "Amount", "Status"];
  const data = [
    ["2025-08-20", "Savings", "100,000 RWF", " Completed"],
    ["2025-08-18", "Loan Repayment", "50,000 RWF", " Completed"],
    ["2025-08-15", "Contribution", "75,000 RWF", " Pending"],
  ];
  const navigate = useNavigate();
  useEffect(() => {
    console.log('Home');
    const userId = localStorage.getItem('userId');
    if (!userId) {
        navigate('/');
    }
}, [navigate]);


  return (
    <MemberLayout>
    
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card title="Contributions" value="15 Payments" color="border-[#005c99]" />
        <Card title="Savings" value="1,200,000 RWF" color="border-green-500" />
        <Card title="Loans" value="500,000 RWF" color="border-red-500" />
        <Card title="Reports" value="5 Reports" color="border-yellow-500" />
      </div>

      {/* Table Section */}
      <h3 className="text-lg font-semibold mb-3">Recent Activities</h3>
      <Table columns={columns} data={data} />
    </MemberLayout>
    
  );
}
