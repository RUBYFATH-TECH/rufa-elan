-- RLS policies for RUFA ELAN e-commerce database

alter table profiles enable row level security;
create policy "Users can manage own profile" on profiles for all using (auth.uid() = id);

alter table addresses enable row level security;
create policy "Users can manage own addresses" on addresses for all using (auth.uid() = user_id);

alter table cart_items enable row level security;
create policy "Users can manage own cart" on cart_items for select using (auth.uid() = user_id);
create policy "Users can modify own cart" on cart_items for insert, update, delete using (auth.uid() = user_id);

alter table wishlists enable row level security;
create policy "Users can manage own wishlist" on wishlists for all using (auth.uid() = user_id);

alter table orders enable row level security;
create policy "Users can view own orders" on orders for select using (auth.uid() = user_id);
create policy "Users can create own orders" on orders for insert with check (auth.uid() = user_id);
create policy "Users can update own orders" on orders for update using (auth.uid() = user_id);

alter table order_items enable row level security;
create policy "Users can view order items for own orders" on order_items for select using (exists (select 1 from orders where orders.id = order_items.order_id and orders.user_id = auth.uid()));
create policy "Users can insert order items with own orders" on order_items for insert with check (exists (select 1 from orders where orders.id = order_items.order_id and orders.user_id = auth.uid()));

alter table reviews enable row level security;
create policy "Users can manage own reviews" on reviews for all using (auth.uid() = user_id);

alter table notifications enable row level security;
create policy "Users can view own notifications" on notifications for select using (auth.uid() = user_id);
create policy "Users can insert notifications for own user" on notifications for insert with check (auth.uid() = user_id);

alter table delivery_tracking enable row level security;
create policy "Users can view delivery tracking for own orders" on delivery_tracking for select using (exists (select 1 from orders where orders.id = delivery_tracking.order_id and orders.user_id = auth.uid()));

alter table tracking_updates enable row level security;
create policy "Users can view tracking updates for own deliveries" on tracking_updates for select using (exists (select 1 from delivery_tracking where delivery_tracking.id = tracking_updates.delivery_tracking_id and exists (select 1 from orders where orders.id = delivery_tracking.order_id and orders.user_id = auth.uid())));

alter table payments enable row level security;
create policy "Users can view own payments" on payments for select using (exists (select 1 from orders where orders.id = payments.order_id and orders.user_id = auth.uid()));

alter table admin_users enable row level security;
create policy "Admin users can access admin users" on admin_users for select, insert, update, delete using (auth.role() = 'authenticated');

alter table categories enable row level security;
create policy "Public categories" on categories for select using (true);
create policy "Admin can manage categories" on categories for insert, update, delete using (auth.role() = 'authenticated');

alter table products enable row level security;
create policy "Public products" on products for select using (status = 'active');
create policy "Admin can manage products" on products for insert, update, delete using (auth.role() = 'authenticated');

alter table product_images enable row level security;
create policy "Public product images" on product_images for select using (true);
create policy "Admin can manage product images" on product_images for insert, update, delete using (auth.role() = 'authenticated');

alter table product_variants enable row level security;
create policy "Public variants" on product_variants for select using (true);
create policy "Admin can manage variants" on product_variants for insert, update, delete using (auth.role() = 'authenticated');

alter table inventory enable row level security;
create policy "Admin can manage inventory" on inventory for all using (auth.role() = 'authenticated');

alter table coupons enable row level security;
create policy "Public coupons" on coupons for select using (active = true);
create policy "Admin can manage coupons" on coupons for insert, update, delete using (auth.role() = 'authenticated');
