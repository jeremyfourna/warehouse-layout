SELECT 
    loc.id_location
    , loc.fk_parent_location
    , loc.name
    , loc.description
    , COUNT(DISTINCT inv.id_inventory)
FROM
    ims_location AS loc
        LEFT JOIN
    wms_inventory AS inv ON inv.fk_location = loc.id_location
WHERE
    description LIKE 'MZ1%'
        AND loc.description != 'MZ1'
        AND loc.fk_mwh_warehouse = 1
        AND loc.is_active = 1
GROUP BY inv.fk_location
ORDER BY description ASC;
