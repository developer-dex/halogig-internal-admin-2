import React, { useState } from "react";
import { Box, Flex, Select, Text, useColorModeValue } from "@chakra-ui/react";
import CategoryManagement from "./CategoryManagement";
import SubCategoryManagement from "./SubCategoryManagement";
import TechnologyManagement from "./TechnologyManagement";

export default function CatTechManagement() {
  const textColor = useColorModeValue("rgb(32, 33, 36)", "white");
  const [page, setPage] = useState("categories");

  return (
    <Box>
      <Flex justify="space-between" align="center" mb="12px" gap={4} flexWrap="wrap">
        <Text color={textColor} fontSize="l" fontWeight="800">
          Cat & Tech Mangement
        </Text>

        <Select
          size="sm"
          w={{ base: "100%", md: "260px" }}
          value={page}
          onChange={(e) => setPage(e.target.value)}
          borderColor="gray.200"
        >
          <option value="categories">Category</option>
          <option value="subcategories">Sub Category</option>
          <option value="technologies">Technologies</option>
        </Select>
      </Flex>

      {page === "categories" && <CategoryManagement />}
      {page === "subcategories" && <SubCategoryManagement />}
      {page === "technologies" && <TechnologyManagement />}
    </Box>
  );
}

