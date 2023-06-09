import http from 'http'
import { Client } from 'pg'
import { data } from './clientdata'

const client = new Client({
    host: data.host,
    port: data.port,
    database: data.database,
    user: data.user,
    password: data.password,
})
 
client.connect().then(() => console.log('connected')).catch((err) => console.error('connection error', err.stack))
// SELECT by page
const selects: {
  [k: string]: string
} = {
  '/task1': "SELECT users.id, users.name, users.avatar_url, photo_url, description, created_at FROM public.users LEFT JOIN public.channels ON users.id = channels.user_id ORDER BY created_at DESC",
  '/task2': "SELECT id, channel_id, title, description, preview_url, file_url, duration, published_at, SUM(CASE WHEN positive THEN 1 ELSE 0 END) AS amount_of_likes FROM public.videos INNER JOIN public.likes ON videos.id = likes.video_id GROUP BY videos.id ORDER BY amount_of_likes DESC LIMIT 5",
  '/task3': "SELECT videos.id, title, preview_url, duration, published_at FROM public.videos INNER JOIN public.subscriptions ON subscriptions.channel_id = videos.channel_id INNER JOIN public.users ON subscriptions.user_id = users.id AND users.name = 'Stephanie Bulger' ORDER BY published_at DESC",
  '/task4': "SELECT channels.id, channels.user_id, description, photo_url, created_at, COUNT(subscriptions.channel_id) AS subscribers FROM public.channels INNER JOIN public.subscriptions ON subscriptions.channel_id = channels.id WHERE channels.id = '79f6ce8f-ee0c-4ef5-9c36-da06b7f4cb76' GROUP BY channels.id",
  '/task5': "SELECT id, channel_id, title, description, preview_url, file_url, duration, published_at, SUM(CASE WHEN positive THEN 1 ELSE 0 END) AS amount_of_likes FROM public.videos INNER JOIN public.likes ON videos.id = likes.video_id WHERE videos.published_at >= '2021-09-01'::date GROUP BY videos.id HAVING SUM(CASE WHEN positive THEN 1 ELSE 0 END) > 4 ORDER BY amount_of_likes DESC LIMIT 10",
  '/task6': "SELECT users.name, users.avatar_url, channels.photo_url, channels.description, level, subscribed_at FROM public.users INNER JOIN public.channels ON channels.user_id = users.id INNER JOIN public.subscriptions ON subscriptions.channel_id = channels.id WHERE subscriptions.channel_id IN (SELECT channels.id FROM public.channels INNER JOIN public.subscriptions ON subscriptions.channel_id = channels.id INNER JOIN public.users ON subscriptions.user_id = users.id WHERE users.name = 'Ennis Haestier') ORDER BY (CASE level WHEN 'vip' THEN 1 WHEN 'follower' THEN 2 WHEN 'fan' THEN 3 WHEN 'standard' THEN 4 END) ASC, subscribed_at DESC"
}

const server = http.createServer((req, result) => {
  if (req.url && req.url in selects){
    client.query(selects[req.url], (err, res) => {
      if (err){
        console.log(err.stack);
        result.writeHead(500, { 'Content-Type': 'text/plain' });
        result.end('Query error');
      } else {
        console.log(res.rows.length);
        result.writeHead(200, { 'Content-Type': 'text/html' });
        result.write(`<html><body><h1>${req.url?.replace('/', '')}</h1><table>`);
        result.write(`<tr><th>${Object.keys(res.rows[0]).join("</th><th>")}</th></tr>`);
        res.rows.forEach(row => {
          result.write(`<tr><td>${Object.values(row).join("</td><td>")}</td></tr>`);
        });
        result.write('</table></body></html>');
        result.end();
      }
    })
  } else {
    result.writeHead(404, { 'Content-Type': 'text/plain' });
    result.end('Page not found');
  }
});

server.listen(8080, () => {
  console.log('Server running on port 8080');
});