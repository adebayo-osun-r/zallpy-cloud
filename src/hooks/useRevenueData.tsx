import { useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { BillingItem, BillingItemCategories, BillingStatus, RevenueData  } from '@/lib/types' // adjust path if needed


const useRevenueData = () => {
    const [revenueData, setRevenueData] = useState<RevenueData[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
  
    useEffect(() => {
      const fetchRevenueData = async () => {
        setLoading(true)
  
        const { data, error } = await supabase
          .from('billing_items')
          .select('*')
  
        if (error) {
          setError(error.message)
          setRevenueData([])
          setLoading(false)
          return
        }
  
        // Group and sum by date + category
        const grouped: Record<string, RevenueData> = {}

        const mappedData: BillingItem[] = data.map((item) => ({
            id: item.id,
            invoiceId: item.invoice_id,
            reservationId: item.reservation_id,
            guestId: item.guest_id,
            description: item.description,
            amount: item.amount,
            category: item.category as BillingItemCategories,  // Cast category
            date: item.date,
            status: item.status as BillingStatus,
          }));
  
          mappedData.forEach((item: BillingItem) => {
          const date = item.date.split('T')[0]
  
          if (!grouped[date]) {
            grouped[date] = {
              date,
              roomRevenue: 0,
              foodRevenue: 0,
              beverageRevenue: 0,
              serviceRevenue: 0,
              otherRevenue: 0,
              totalRevenue: 0,
            }
          }
  
          const revenueItem = grouped[date]
  
          switch (item.category) {
            case 'Room':
              revenueItem.roomRevenue += item.amount
              break
            case 'Food':
              revenueItem.foodRevenue += item.amount
              break
            case 'Beverage':
              revenueItem.beverageRevenue += item.amount
              break
            case 'Service':
              revenueItem.serviceRevenue += item.amount
              break
            default:
              revenueItem.otherRevenue += item.amount
          }
  
          revenueItem.totalRevenue += item.amount
        })
  
        const result = Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date))
        setRevenueData(result)
        setLoading(false)
      }
  
      fetchRevenueData()
    }, [])
  
    return { revenueData, loading, error }
  }
  
  export default useRevenueData