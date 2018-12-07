

select 
  min.pet, 
  min.price, min.realm_name, max.price, max.realm_name,
  max.price - min.price as diff

from (

  select p.pet, p.price, r.name as realm_name
  from price p

  inner join (

    select pet, min(price) as min_price
    from price
    inner join realm
    group by pet, pricesource

  ) m on m.min_price = p.price and m.pet = p.pet

  inner join realm r on r.id = p.realmid

) min

inner join (

  select p.pet, p.price, r.name as realm_name
  from price p

  inner join (

    select pet, max(price) as max_price
    from price
    group by pet, pricesource

  ) m on m.max_price = p.price and m.pet = p.pet

  inner join realm r on r.id = p.realmid

) max on max.pet = min.pet

order by diff desc


