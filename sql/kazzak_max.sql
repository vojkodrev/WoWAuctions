

select 
  k.pet, k.price, k.realm_name,
  max.price, max.realm_name,
  max.price - k.price as diff

from (

  select p.pet, p.price, r.name as realm_name
  from price p
  inner join realm r on r.id = p.realmid and r.name = 'Kazzak'
  where p.pricesource = 'DBMinBuyout' and p.price <= 1000

) k

inner join (

  select p.pet, p.price, r.name as realm_name
  from price p

  inner join (

    select pet, max(price) as max_price
    from price
	  where pricesource = 'DBHistorical'
    group by pet, pricesource

  ) m on m.max_price = p.price and m.pet = p.pet and p.pricesource = 'DBHistorical'

  inner join realm r on r.id = p.realmid

) max on max.pet = k.pet

order by diff desc


