import { Container, Flex, Grid, Heading, Input, Skeleton, Spinner } from "@chakra-ui/react"
import { useEffect, useState } from "react"
import { searchData } from "../../services/api";
import CardComponent from "../../components/CardComponent";
import PaginationComponent from "../../components/PaginationComponent";

const Search = () => {
  const [searchValue, setSearchValue] = useState("");
  const [tempSearchValue, setTempSearchValue] = useState('');
  const [activePage, setActivePage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState([]);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setIsLoading(true);
    searchData(searchValue, activePage).then((res) => {
      console.log(res, 'res');
      setData(res?.results);
      setActivePage(res?.page);
      setTotalPages(res?.total_pages);
    }).catch((err) => console.log(err, 'err')).finally(() => setIsLoading(false));
  }, [searchValue, activePage]);
  

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchValue(tempSearchValue); 
  };


  return (
    <Container maxW={"container-xl"}>
        <Flex alignItems={"baseline"} gap={"4"} my={"10"}>
          <Heading color={"white"} as="h2" fontSize={"md"} textTransform={"uppercase"}>Search</Heading>
        </Flex>

        <form onSubmit={handleSearch}>
          <Input color={"white"} placeholder="Search..." _placeholder={{color: "gray.100"}} value={tempSearchValue} onChange={(e) => setTempSearchValue(e.target.value)} />
        </form>

        {isLoading && (
          <Flex justifyContent={"center"} mt="10">
            <Spinner size={"xl"} color="red" />
          </Flex>
        )}

        {data?.length === 0 && !isLoading && (
          <Heading color={"white"} textAlign={"center"} as="h3" fontSize={"sm"} mt="10">
            No results found
          </Heading>
        )}

        <Grid templateColumns={{
            base: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(4, 1fr)",
            lg: "repeat(5, 1fr)"
        }} gap="4" mt="6">  
            {data?.length > 0 && !isLoading && data?.map((item, i) => 
                // <img key={item?.id} src={`${imagePath}/${item?.poster_path}`} />
                isLoading ? (
                    <Skeleton height={300} color={"black"} key={i} />
                ) : (
                    <CardComponent key={item?.id} item={item} type={item?.media_type}/>
                )
            )}
        </Grid> 

       {data?.length > 0 && !isLoading && (
         <PaginationComponent activePage={activePage} totalPages={totalPages} setActivePage={setActivePage} />
       )}
    </Container>
  )
}

export default Search