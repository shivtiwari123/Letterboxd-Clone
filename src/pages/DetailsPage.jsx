import { Badge, Box, Button, CircularProgress, CircularProgressLabel, Container, Flex, Heading, Image, Spinner, Text, useToast } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom"
import { fetchCredits, fetchDetails, fetchVideos, imagePath, imagePathOriginal } from "../services/api";
import { CalendarIcon, CheckCircleIcon, SmallAddIcon, TimeIcon } from "@chakra-ui/icons";
import { minsToHours, ratingToPercentage, resolveRatingColour } from "../utils/helpers";
import VideoComponent from "../components/VideoComponent";
import { useAuth } from "../context/useAuth";
import { useFirestore } from "../services/firestore";

const DetailsPage = () => {
    const router = useParams();
    const { type, id } = router;
    const [details, setDetails] = useState({});
    const [video, setVideo] = useState(null);
    const [videos, setVideos] = useState([]);
    const [cast, setCast] = useState([]);
    const [loading, setLoading] = useState(true);

    const { user } = useAuth();
    const toast = useToast();
    const { addToWatchlist, checkIfInWatchlist, removeFromWatchlist } = useFirestore();

    const [isInWatchlist, setIsInWatchlist] = useState(false);

    // useEffect(() => {
    //   fetchDetails(type, id).then((res) => {
    //     console.log(res, 'res');
    //     setDetails(res)
    //   }).catch((err) => {
    //     console.log(err, 'err');
    //   }).finally(() => {
    //     setLoading(false);
    //   });
    // }, [type, id]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [detailsData, creditsData, videosData] = await Promise.all([
                    fetchDetails(type, id),
                    fetchCredits(type, id),
                    fetchVideos(type, id)
                ])

                setDetails(detailsData);
                setCast(creditsData?.cast?.slice(0, 8)); 

                const video = videosData?.results?.find((video) => video?.type === "Trailer");
                setVideo(video);

                const videos = videosData?.results?.filter((video) => video?.type !== "Trailer")?.slice(0, 10);
                setVideos(videos);

            } catch (error) {
                console.log('error', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData()
    }, [type, id]);

    console.log(video, videos, 'videos');

    

    const handleSaveToWatchlist = async () => {

        if (!user) {
            toast({
                title: "Login to add to watchlist",
                status: 'error',
                isClosable: true
            });
            return;
        };

        const data = {
            id: details?.id,
            title: details?.title || details?.name,
            type: type,
            poster_path: details?.poster_path,
            release_date: details?.release_date || details?.first_air_date,
            vote_average: details?.vote_average,
            overview: details?.overview,
        };

        // console.log(data, 'data');

        // addDocument("watchlist", data);
        const dataId = data?.id?.toString();
        await addToWatchlist(user?.uid, dataId, data);
        const isSetToWatchlist = await checkIfInWatchlist(user?.uid, dataId);
        setIsInWatchlist(isSetToWatchlist);
    };

    

    useEffect(() => {
      if (!user) {
        setIsInWatchlist(false);
        return;
      }

      checkIfInWatchlist(user?.uid, id).then((data) => {
        setIsInWatchlist(data);
      });
    }, [id, user, checkIfInWatchlist]);
    
    const handleRemoveFromWatchlist = async () => {
        await removeFromWatchlist(user?.uid, id);
        const isSetToWatchlist = await checkIfInWatchlist(user?.uid, id);
        setIsInWatchlist(isSetToWatchlist);
    }

    if (loading) {
        return (
            <Flex justify={"center"}>
                <Spinner size={"xl"} color="red" />
            </Flex>
        )
    }
    
    const title = details?.title || details?.name;
    const releaseDate = type === "tv" ? details?.first_air_date : details?.release_date;

  return (
    <Box>
        <Box 
            background={`linear-gradient(rgba(0,0,0,.80), rgba(0,0,0,.80)), url(${imagePathOriginal}/${details?.backdrop_path})`}
            backgroundRepeat={"no-repeat"}
            backgroundSize={"cover"}
            backgroundPosition={"center"}
            w={"100%"}
            h={{base: "auto", md: "500px"}}
            py={"2"}
            display={"flex"}
            alignItems={"center"}
            zIndex={"-1"}
        >
            <Container maxW={"container.xl"}>
                <Flex alignItems={"center"} gap="10" flexDirection={{base: "column", md: "row"}}>
                    <img height={300} width={300} borderRadius={"sm"} src={`${imagePath}/${details?.poster_path}`} />
                    <Box>
                        <Heading color={"white"}fontSize={"3xl"}>
                            {title} 
                            {"  "}
                            <Text as={"span"} fontWeight={"normal"} color={"gray.400"}>{new Date(releaseDate).getFullYear()}</Text>
                        </Heading>

                        <Flex alignItems={"center"} gap={"4"} mt={1} mb={5}>
                            <Flex alignItems={"center"}>
                                <CalendarIcon mr={2} color={"gray.400"}/>
                                <Text color={"white"} fontSize={"sm"}>
                                {new Date(releaseDate).toLocaleDateString("en-IN")} (US)
                                </Text>
                            </Flex>

                            {type === "movie" && (
                            <>
                                <Box>*</Box>
                                <Flex alignItems={"center"}>
                                    <TimeIcon mr="2" color={"gray.400"} />
                                    <Text color={"white"} fontSize={"sm"}>{minsToHours(details?.runtime)}</Text>
                                </Flex>
                            </>
                        )}
                        </Flex>

                        

                        <Flex color={"white"} alignItems={"center"} gap="4"> 
                            <CircularProgress value={ratingToPercentage(details?.vote_average)} bg={"gray.800"} borderRadius={"full"} p={"0.5"} size={"70px"} color={resolveRatingColour(details?.vote_average)} thickness={"6px"}>
                                <CircularProgressLabel fontSize={"lg"}>
                                    {ratingToPercentage(details?.vote_average)} {" "}
                                    <Box as="span" fontSize={"10px"}>%</Box>
                                </CircularProgressLabel>
                            </CircularProgress>
                            <Text color={"white"} display={{base: "none", md: "initial"}}>User Score</Text>
                            {isInWatchlist ? (
                                  <Button leftIcon={<CheckCircleIcon />} colorScheme="green" variant={"outline"} onClick={handleRemoveFromWatchlist} >In watchlist</Button>
                            ) : (
                                <Button colorScheme="white" leftIcon={<SmallAddIcon />} variant={"outline"} onClick={handleSaveToWatchlist}>Add to watchlist</Button>
                            )}
                        </Flex>
                        <Text color={"gray.400"} fontSize={"sm"} fontStyle={"italic"} my="5">
                            {details?.tagline}
                        </Text>
                        <Heading color={"white"} fontSize={"xl"} mb={"3"}>Overview</Heading>
                        <Text color={"white"} fontSize={"md"} mb={"3"}>{details?.overview}</Text>
                        
                    </Box>
                </Flex>
            </Container>
        </Box>

        <Container maxW={"container.xl"} pb="10">
            <Heading color={"white"} as="h2" fontSize={"md"} textTransform={"uppercase"} mt="10" >
                Cast
            </Heading>

            <Flex mt="5" mb="10" overflowX={"scroll"} gap={"5"}>
                {cast?.length === 0 && <Text>No cast found</Text>}
                {cast && cast?.map((item) => (
                    <Box key={item?.id} minW={"150px"}>
                        <Image src={`${imagePath}/${item?.profile_path}`} w={"100%"} height={"225px"} objectFit={"cover"} borderRadius={"sm"}/> 
                    </Box>
                ))}
            </Flex>
            
            <Heading color={"white"} as="h2" fontSize={"md"} textTransform={"uppercase"} mt="10" mb="5">Videos</Heading>
            
            <VideoComponent backgroundColor="gray.900" id={video?.key} />
            <Flex mt="5" mb="10" overflowX={"scroll"} gap={"5"}>
                {videos && videos?.map((item) => (
                    <Box key={item?.id} minW={"200px"}>
                        <VideoComponent id={item?.key} small />
                        <Text color={"white"} fontSize={"sm"} fontWeight={"bold"} mt="2" noOfLines={2}>
                            {item?.name}
                        </Text>
                    </Box>
                ))}
            </Flex>
            
        </Container>
    </Box>
  )
}

export default DetailsPage