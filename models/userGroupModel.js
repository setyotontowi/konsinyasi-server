import pool from "../config/db.js";

export const listAllUserGroups = async () => {
  const [rows] = await pool.query(
    `SELECT 
        g.id,
        g.group_nama,
        COUNT(u.id) AS user_count
    FROM 
        md_users_group g
    LEFT JOIN 
        md_users u 
        ON u.id_users_group = g.id 
    GROUP BY 
        g.id, g.group_nama
    ORDER BY 
        g.group_nama;`
  );

  console.log(rows);
  return rows;
}