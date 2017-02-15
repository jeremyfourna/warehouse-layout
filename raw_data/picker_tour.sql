SELECT 
    dat.username,
    dat.history_created_at,
    hist2.fk_location AS location_picked_from,
    loc.description
FROM
    (SELECT 
        user.username,
            hist.history_created_at,
            MAX(invh.id_inventory_history) AS latest_hist_id,
            hist.id_inventory
    FROM
        wms_inventory_history AS hist
    LEFT JOIN (SELECT 
        invh.id_inventory,
            invh.id_inventory_history,
            invh.fk_location,
            invh.updated_at
    FROM
        wms_inventory_history AS invh
    WHERE
        invh.fk_inventory_status = 1
    ORDER BY invh.updated_at DESC) AS invh ON invh.id_inventory = hist.id_inventory
        AND invh.updated_at <= hist.history_created_at
    INNER JOIN ims_user AS user ON user.id_user = hist.history_created_by
    INNER JOIN ims_location AS loc ON loc.id_location = hist.fk_location
    WHERE
        hist.fk_inventory_status = 11
            AND loc.description = 'PICKED'
            AND DATE(history_created_at) = '2017-01-20'
            AND hist.fk_current_warehouse = 1
    GROUP BY hist.id_inventory , user.username
    ORDER BY user.username , hist.history_created_at) AS dat
        INNER JOIN
    wms_inventory_history AS hist2 ON hist2.id_inventory_history = dat.latest_hist_id
        INNER JOIN
    ims_location AS loc ON loc.id_location = hist2.fk_location;
