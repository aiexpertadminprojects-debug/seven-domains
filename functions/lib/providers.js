// Provider adapters are deliberately disabled until you choose an authorised vendor.
export async function registrarAvailability(domain,env) {
  return {configured:false,status:"NOT_CONFIGURED",message:"Connect an authorised registrar/reseller API before checking availability."};
}
export async function provisionHosting(order,env) {
  return {configured:false,status:"NOT_CONFIGURED",message:"Connect and test a hosting provider API before provisioning."};
}
export async function createPaymentOrder(order,env) {
  return {configured:false,status:"NOT_CONFIGURED",message:"Connect a payment gateway and verify server-side signatures/webhooks."};
}
